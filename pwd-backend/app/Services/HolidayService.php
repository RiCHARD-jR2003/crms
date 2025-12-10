<?php

namespace App\Services;

use Carbon\Carbon;

class HolidayService
{
    /**
     * Get list of regular holidays (fixed dates)
     * Format: 'MM-DD' => 'Holiday Name'
     */
    private static function getRegularHolidays(): array
    {
        return [
            '01-01' => "New Year's Day",
            '04-02' => 'Maundy Thursday',
            '04-03' => 'Good Friday',
            '04-09' => 'Araw ng Kagitingan',
            '05-01' => 'Labor Day',
            '06-12' => 'Independence Day',
            '08-31' => 'National Heroes Day',
            '11-30' => 'Bonifacio Day',
            '12-25' => 'Christmas Day',
            '12-30' => 'Rizal Day',
        ];
    }

    /**
     * Get list of special (non-working) holidays (fixed dates)
     * Format: 'MM-DD' => 'Holiday Name'
     */
    private static function getSpecialHolidays(): array
    {
        return [
            '08-21' => 'Ninoy Aquino Day',
            '11-01' => "All Saints' Day",
            '12-08' => 'Feast of the Immaculate Conception of Mary',
            '12-31' => 'Last Day of the Year',
            '02-17' => 'Chinese New Year', // Note: This varies by year, but using fixed date as provided
            '04-04' => 'Black Saturday',
            '11-02' => "All Souls' Day",
            '12-24' => 'Christmas Eve',
        ];
    }

    /**
     * Check if a given date is a holiday
     *
     * @param Carbon $date
     * @return bool
     */
    public static function isHoliday(Carbon $date): bool
    {
        $dateString = $date->format('m-d');
        
        // Check regular holidays
        if (isset(self::getRegularHolidays()[$dateString])) {
            return true;
        }
        
        // Check special holidays
        if (isset(self::getSpecialHolidays()[$dateString])) {
            return true;
        }
        
        return false;
    }

    /**
     * Get holiday name for a given date
     *
     * @param Carbon $date
     * @return string|null
     */
    public static function getHolidayName(Carbon $date): ?string
    {
        $dateString = $date->format('m-d');
        
        $regularHolidays = self::getRegularHolidays();
        if (isset($regularHolidays[$dateString])) {
            return $regularHolidays[$dateString];
        }
        
        $specialHolidays = self::getSpecialHolidays();
        if (isset($specialHolidays[$dateString])) {
            return $specialHolidays[$dateString];
        }
        
        return null;
    }

    /**
     * Check if a date is a business day (not weekend and not holiday)
     *
     * @param Carbon $date
     * @return bool
     */
    public static function isBusinessDay(Carbon $date): bool
    {
        // Check if it's a weekend
        if ($date->isWeekend()) {
            return false;
        }
        
        // Check if it's a holiday
        if (self::isHoliday($date)) {
            return false;
        }
        
        return true;
    }

    /**
     * Calculate the date that is X business days from a start date
     * Business days exclude weekends and holidays
     *
     * @param Carbon $startDate
     * @param int $businessDays
     * @return Carbon
     */
    public static function addBusinessDays(Carbon $startDate, int $businessDays): Carbon
    {
        $currentDate = $startDate->copy();
        $daysAdded = 0;
        
        while ($daysAdded < $businessDays) {
            $currentDate->addDay();
            
            // Only count business days (weekdays that are not holidays)
            if (self::isBusinessDay($currentDate)) {
                $daysAdded++;
            }
        }
        
        return $currentDate;
    }

    /**
     * Calculate the number of business days between two dates
     * Business days exclude weekends and holidays
     * Note: This counts from startDate (inclusive) to endDate (inclusive)
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return int
     */
    public static function countBusinessDays(Carbon $startDate, Carbon $endDate): int
    {
        $businessDays = 0;
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            if (self::isBusinessDay($currentDate)) {
                $businessDays++;
            }
            $currentDate->addDay();
        }
        
        return $businessDays;
    }
}

