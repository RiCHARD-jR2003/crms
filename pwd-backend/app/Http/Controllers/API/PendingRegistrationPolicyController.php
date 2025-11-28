<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PendingRegistrationPolicySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PendingRegistrationPolicyController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        try {
            $settings = PendingRegistrationPolicySetting::all();
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific setting
     */
    public function show($key)
    {
        try {
            $setting = PendingRegistrationPolicySetting::where('key', $key)->first();
            
            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'holding_duration_hours' => 'nullable|integer|min:1|max:168', // Max 7 days
                'expiry_action' => 'nullable|in:expire,reject',
                'reminder_hours_before_expiry' => 'nullable|integer|min:1|max:72',
                'enable_pending_policy' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = [];

            if ($request->has('holding_duration_hours')) {
                PendingRegistrationPolicySetting::setValue(
                    'holding_duration_hours',
                    (string) $request->holding_duration_hours
                );
                $updated[] = 'holding_duration_hours';
            }

            if ($request->has('expiry_action')) {
                PendingRegistrationPolicySetting::setValue(
                    'expiry_action',
                    $request->expiry_action
                );
                $updated[] = 'expiry_action';
            }

            if ($request->has('reminder_hours_before_expiry')) {
                PendingRegistrationPolicySetting::setValue(
                    'reminder_hours_before_expiry',
                    (string) $request->reminder_hours_before_expiry
                );
                $updated[] = 'reminder_hours_before_expiry';
            }

            if ($request->has('enable_pending_policy')) {
                PendingRegistrationPolicySetting::setValue(
                    'enable_pending_policy',
                    $request->enable_pending_policy ? 'true' : 'false'
                );
                $updated[] = 'enable_pending_policy';
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'updated' => $updated,
                'data' => PendingRegistrationPolicySetting::getAllSettings()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

