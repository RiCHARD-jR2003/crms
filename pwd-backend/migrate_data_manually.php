<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->boot();

use Illuminate\Support\Facades\DB;

echo "Starting manual data migration...\n";

// Configure SQLite connection
config([
    'database.connections.sqlite_migration' => [
        'driver' => 'sqlite',
        'database' => database_path('database.sqlite'),
        'prefix' => '',
        'foreign_key_constraints' => true,
    ]
]);

try {
    // Get users from SQLite
    $users = DB::connection('sqlite_migration')->table('users')->get();
    
    echo "Found " . count($users) . " users in SQLite\n";
    
    if (count($users) > 0) {
        // Check current MySQL users
        echo "Current users in MySQL: " . DB::connection('mysql')->table('users')->count() . "\n";
        
        // Insert users into MySQL
        foreach ($users as $user) {
            $userArray = (array) $user;
            
            // Check if user already exists
            $existingUser = DB::connection('mysql')->table('users')-> where('email', $user->email)->first();
            
            if (!$existingUser) {
                DB::connection('mysql')->table('users')->insert($userArray);
                echo "Inserted user: " . $user->email . "\n";
            } else {
                echo "User already exists: " . $user->email . "\n";
            }
        }
        
        echo "Users migration completed!\n";
        echo "Final user count in MySQL: " . DB::connection('mysql')->table('users')->count() . "\n";
    } else {
        echo "No users to migrate.\n";
    }
    
    // Check if there are any other tables with data
    echo "\nChecking other tables for data...\n";
    
    $tables = ['admin', 'pwd_members', 'applications', 'benefits', 'announcements'];
    
    foreach ($tables as $table) {
        try {
            $count = DB::connection('sqlite_migration')->table($table)->count();
            echo "SQLite {$table}: {$count} records\n";
            
            if ($count > 0) {
                echo "Data exists in {$table} - consider migrating manually if needed\n";
            }
        } catch (Exception $e) {
            echo "Error checking {$table}: " . $e->getMessage() . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
}

echo "\nMigration completed!\n";
