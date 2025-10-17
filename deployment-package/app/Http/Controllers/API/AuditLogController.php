<?php
// app/Http/Controllers/API/AuditLogController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index()
    {
        $logs = AuditLog::with('user')->orderBy('timestamp', 'desc')->get();
        return response()->json($logs);
    }

    public function getByUser($userId)
    {
        $logs = AuditLog::with('user')
            ->where('userID', $userId)
            ->orderBy('timestamp', 'desc')
            ->get();
            
        return response()->json($logs);
    }

    public function getByAction($action)
    {
        $logs = AuditLog::with('user')
            ->where('action', 'LIKE', "%{$action}%")
            ->orderBy('timestamp', 'desc')
            ->get();
            
        return response()->json($logs);
    }
}