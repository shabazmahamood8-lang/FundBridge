import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { DataStore } from '../services/dataStore.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role, photoUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = role === 'creator' ? 'creator' : 'supporter';
    const existing = await DataStore.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Default credits as per requirements: Supporter = 50, Creator = 20
    const initialCredits = assignedRole === 'creator' ? 20 : 50;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await DataStore.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`,
      passwordHash,
      role: assignedRole,
      credits: initialCredits,
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Welcome notification
    await DataStore.createNotification({
      toEmail: user.email,
      message: `Welcome to FundBridge, ${user.name}! You received ${initialCredits} bonus onboarding credits.`,
      actionRoute: assignedRole === 'creator' ? '/dashboard/add-campaign' : '/dashboard/explore',
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await DataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. No user found with this email.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
}

export async function googleAuth(req: Request, res: Response) {
  try {
    const { credential, code, role } = req.body;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'GOOGLE_CLIENT_ID is not configured on the server. Please configure it in your environment variables.',
      });
    }

    const oAuth2Client = new OAuth2Client(clientId, clientSecret);
    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedPhoto = '';

    if (credential) {
      // 1. Verify Google ID Token cryptographically using Google public certs
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ success: false, message: 'Invalid Google ID token payload.' });
      }

      verifiedEmail = payload.email.toLowerCase().trim();
      verifiedName = payload.name || verifiedEmail.split('@')[0];
      verifiedPhoto =
        payload.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(verifiedName)}&background=0D9488&color=fff`;
    } else if (code) {
      // Authorization code flow
      const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:3000';
      const { tokens } = await oAuth2Client.getToken({
        code,
        redirect_uri: clientUrl,
      });

      if (!tokens.id_token) {
        return res.status(400).json({
          success: false,
          message: 'Google code exchange failed to return ID token.',
        });
      }

      const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ success: false, message: 'Invalid Google token payload.' });
      }

      verifiedEmail = payload.email.toLowerCase().trim();
      verifiedName = payload.name || verifiedEmail.split('@')[0];
      verifiedPhoto =
        payload.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(verifiedName)}&background=0D9488&color=fff`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google credential (ID token) or authorization code is required for secure authentication.',
      });
    }

    // 2. Find existing user by verified email
    let user = await DataStore.findUserByEmail(verifiedEmail);

    // 3. Create user if necessary
    if (!user) {
      const assignedRole = role === 'creator' ? 'creator' : 'supporter';
      const initialCredits = assignedRole === 'creator' ? 20 : 50;
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).substring(2) + '!FundBridge9';
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await DataStore.createUser({
        name: verifiedName.trim(),
        email: verifiedEmail,
        photoUrl: verifiedPhoto,
        passwordHash,
        role: assignedRole,
        credits: initialCredits,
      });

      await DataStore.createNotification({
        toEmail: user.email,
        message: `Welcome to FundBridge via Google, ${user.name}! ${initialCredits} bonus onboarding credits have been added.`,
        actionRoute: assignedRole === 'creator' ? '/dashboard/add-campaign' : '/dashboard/explore',
      });
    }

    // 4. Generate standard JWT
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // 5. Return authenticated user & session
    return res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        photoUrl: user.photoUrl,
      },
    });
  } catch (error: any) {
    console.error('[Google OAuth Error]', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || 'Google authentication verification failed.',
    });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const freshUser = await DataStore.findUserByEmail(req.user.email);
    if (!freshUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: freshUser._id.toString(),
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        credits: freshUser.credits,
        photoUrl: freshUser.photoUrl,
        createdAt: freshUser.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch user profile.' });
  }
}
