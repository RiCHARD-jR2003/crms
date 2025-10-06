<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use App\Models\Application;
use App\Models\User;

class NoDuplicateApplication implements Rule
{
    protected $field;
    protected $value;
    protected $excludeApplicationId;

    public function __construct($field, $excludeApplicationId = null)
    {
        $this->field = $field;
        $this->excludeApplicationId = $excludeApplicationId;
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $this->value = $value;
        
        // Check for duplicate applications
        $query = Application::where($this->field, $value);
        
        // Exclude current application if updating
        if ($this->excludeApplicationId) {
            $query->where('applicationID', '!=', $this->excludeApplicationId);
        }
        
        $duplicateApplication = $query->first();
        
        if ($duplicateApplication) {
            return false;
        }
        
        // Also check if user already exists (approved applications create user accounts)
        $existingUser = User::where('email', $value)->first();
        if ($existingUser && $existingUser->role === 'PWDMember') {
            return false;
        }
        
        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        $fieldName = ucfirst(str_replace('_', ' ', $this->field));
        
        return "A PWD application with this {$fieldName} already exists. Please check your existing application status or contact support if you believe this is an error.";
    }
}
