<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     * 
     * POST /api/register
     * Body: { name, email, password, password_confirmation }
     */
    public function register(Request $request)
    {
        // Validate incoming data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create new user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => false, // New users are not admins
        ]);

        // Create API token for the user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return user data and token
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    /**
     * Login user
     * 
     * POST /api/login
     * Body: { email, password }
     */
    public function login(Request $request)
    {
        // Validate incoming data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create API token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return token and user data
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Logout user (delete current token)
     * 
     * POST /api/logout
     * Headers: { Authorization: Bearer {token} }
     */
    public function logout(Request $request)
    {
        // Delete the current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get current authenticated user
     * 
     * GET /api/user
     * Headers: { Authorization: Bearer {token} }
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}