<?php

/*
|--------------------------------------------------------------------------
| Load The Cached Routes
|--------------------------------------------------------------------------
|
| Here we will decode and unserialize the RouteCollection instance that
| holds all of the route information for an application. This allows
| us to instantaneously load the entire route map into the router.
|
*/

app('router')->setCompiledRoutes(
    array (
  'compiled' => 
  array (
    0 => false,
    1 => 
    array (
      '/sanctum/csrf-cookie' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'sanctum.csrf-cookie',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-direct' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mxCQc94noSGh1XLq',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/login' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::HhVUf7gG4WJeD8yG',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/applications/dashboard/stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::orvf0SDyBxZnrMOz',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/applications' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::w0yrZD5pM4Z6V3Jr',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1TVxnNhmqPoOpAtq',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/dashboard/stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::4c6CRkTwdJMM1aQi',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/announcements' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::jzmuqo6KVM00fRuB',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::4WDIh6vTQnh3bGDB',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/announcements/admin' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::E2u1ormUG3N8dGYb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/support/tickets' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::XtfrinY56HqWRNTJ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::RcghXejI6PFL4ofi',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/pwd-member/profile' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::D1F6kESRDQVYVN4x',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::QBg34j4s0X3Uf4mq',
          ),
          1 => NULL,
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/pwd-member/change-password' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::SMGFwc5FCWmVJ3dc',
          ),
          1 => NULL,
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/reset-password' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::bQo3dC6Dksp8uqvb',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/change-password' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::XmF3HVuoPdSwMmF0',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/reset-user-password' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::UKRUV5TYSvJrFwx8',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-pwd-creation' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::N117Op3xGEbhup2M',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/language/change' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::3pCcNKxuDg5Kdh94',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/language/current' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::goVACxhadlFiXAZ4',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/language/supported' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::PkAlRqpte7wZ5bc0',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard-stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::QS9XitG0F0uwdMbW',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard-monthly' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::uC0HlNdbPy1W0Oc4',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard-activities' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::cCxsPsshJqXRmdVx',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard-coordination' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::DK8koNrTaJBDZWQn',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/pwd-members-fallback' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::QC3EHIz8StYr7qyE',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-database-email' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Ri5318xXJJHGcdri',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-gmail-integration' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::PqP0MdDu4kHxG9wq',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-application-submission' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IkhNJ4e2kP2k9FFs',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/mobile-test' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::T4kUHvENuSLv3Bm9',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-pwd' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::vccOULw7bNpQBAkb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/simple-pwd' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::EOLz7IWxZR8SICir',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/debug-pwd-applications' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::bQgUzW4QCl3vua24',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/mock-pwd' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::URjHsrlkasOZRJg8',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/users' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'users.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'users.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/complaints' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'complaints.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'complaints.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/reports' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'reports.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'reports.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/register' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::zX0IStLZqFZjr3MJ',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/logout' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::71vqUz08CbNOPQB2',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/benefits' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'benefits.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'benefits.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-benefits' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Ki0a1NWsLUsxT05Y',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/benefits-simple' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::CKpGDoqqUoTLrSik',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Cwq2RTj5D8Pv5Rpr',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/benefit-claims' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'benefit-claims.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'benefit-claims.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/documents/public' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::fxPeGoHpMi8sG3m6',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/send-verification-code' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::rY42HrfFT5wfuNLv',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/verify-code' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Z1EvDBA9zDIMmkmP',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-storage-config' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::b7Eqr8cDp0qa2qto',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/user' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::kWdZAd2JA9eOWxXP',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/pwd-members' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'pwd-members.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'pwd-members.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/audit-logs' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::NAEACmJ6tAB3KUcR',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/support-tickets/archived' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ZagNqTKT74LlKc8h',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/support-tickets' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'support-tickets.index',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'support-tickets.store',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard/test' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Vpy248rOjFN8ioT9',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard/recent-activities' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0FFnP9aqa5rJF5b3',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/dashboard/barangay-contacts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::RtO0W4iFT7I9gEs5',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/gmail/auth-url' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::EDuqGLTktNUObrAn',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/gmail/callback' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BB94t1CGpHNoZORA',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/gmail/test' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::cm6YqJxWjNIf0ym0',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/gmail/status' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YbHEwLqnFBGiOwzO',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/analytics/suggestions' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ZaURc4xGPYWZYwOD',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/analytics/suggestions/summary' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::2FtTe2hZm0c4FIid',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/analytics/suggestions/high-priority' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gARJZGpOAcPxatxF',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/analytics/transaction-analysis' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mtTTTLmeGILJ3CEK',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/documents' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::WDJ30P5Jf1uU20Qi',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::nLf2S4vaV14PjG8L',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/migrate-documents' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::s7Bxc2rbNQtAKml5',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/migration-status' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::obu0iyjqeq2TpffT',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/migrate-all-documents' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::4pLXela2mTcwwYYo',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IGLi532pbz3Jg9jb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications/unread' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::jt1Fzkw5pJr7JWRu',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications/mark-all-read' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::wxA2evgCGIUT8Vxz',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/api/test-basic' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::s0WJfvmbjjzSlZIW',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/api/test-richard-pwd1' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gR07cNvARcZ2hC3R',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-basic' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::nKoqSVIFdZB7Vevo',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-benefit-controller' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::N3iHSYg3SaJ1Z7Ha',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-benefit-model' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BgYFI1SZ6Nx3bLlf',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/check-benefits-table' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::wy0KOfeTt8wuEEHw',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/check-pwd-birthdays' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::iM8s5veSBTKi5WL5',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-login' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::t1cJeXLyJ3PsJ1pO',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::buRu4m4UDQN6W6M3',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/test-web' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ZoBBBfDu3DTtVAcZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test-web' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Sa1fXf0a6Z3eUZB9',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/login' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'login',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
    ),
    2 => 
    array (
      0 => '{^(?|/api/(?|a(?|p(?|plication(?|s/(?|([^/]++)(?|(*:51)|/(?|status(*:68)|approve\\-(?|barangay(*:95)|admin(*:107))|reject(*:122)))|status/([^/]++)(*:147)|barangay/([^/]++)/status/([^/]++)(*:188)|check\\-duplicates(*:213))|\\-(?|status/([^/]++)(*:242)|file/([^/]++)/([^/]++)(*:272)))|i/test\\-(?|email/([^/]++)(*:307)|a(?|dmin\\-approve/([^/]++)(*:341)|pprove\\-application/([^/]++)(*:377))))|n(?|nouncements/(?|([^/]++)(?|(*:418))|audience/([^/]++)(*:444)|([^/]++)(?|(*:463)))|alytics/suggestions/category/([^/]++)(*:510))|udit\\-logs/(?|user/([^/]++)(*:546)|action/([^/]++)(*:569)))|support(?|/tickets/([^/]++)/reply(*:612)|\\-tickets/(?|messages/([^/]++)/download(*:659)|([^/]++)(?|(*:678)|/messages(*:695))|messages/([^/]++)/force\\-download(*:737)))|test\\-(?|pwd\\-login/([^/]++)(*:775)|a(?|pprov(?|e\\-application/([^/]++)(*:818)|al\\-email/([^/]++)(*:844))|dmin\\-approve/([^/]++)(*:875))|s(?|end\\-approval\\-email/([^/]++)(*:917)|mtp/([^/]++)(*:937))|file/([^/]++)(*:959)|document\\-file/([^/]++)(*:990))|users/([^/]++)(?|(*:1016)|(*:1025))|c(?|heck\\-user\\-status/([^/]++)(*:1066)|omplaints/([^/]++)(?|(*:1096)|/status(*:1112))|reate\\-pwd\\-member/([^/]++)(*:1149))|re(?|ports/(?|([^/]++)(?|(*:1184))|generate/([^/]++)(*:1211)|b(?|arangay\\-(?|stats/([^/]++)(*:1250)|performance(*:1270))|enefit\\-distribution/([^/]++)(*:1309))|pwd\\-masterlist/([^/]++)(*:1343)|a(?|pplication\\-status/([^/]++)(*:1383)|ge\\-group\\-analysis/([^/]++)(*:1420)|ll\\-barangays(*:1442))|disability\\-distribution/([^/]++)(*:1485)|monthly\\-activity/([^/]++)(*:1520)|city\\-wide\\-stats(*:1546)|([^/]++)/download(*:1572))|set\\-password/([^/]++)(*:1604))|benefit(?|s(?|/([^/]++)(?|(*:1640)|(*:1649))|\\-simple/([^/]++)(?|(*:1679)))|\\-claims/([^/]++)(?|(*:1710)|/status(*:1726)|(*:1735)))|documents/(?|file/([^/]++)(*:1772)|([^/]++)(?|(*:1792))|pending\\-reviews(*:1818)|([^/]++)/review(*:1842)|my\\-documents(*:1864)|upload(*:1879)|notifications(?|(*:1904)|/([^/]++)/read(*:1927)))|pwd\\-members/([^/]++)(?|(*:1962)|/(?|applications(*:1987)|complaints(*:2006)|benefit\\-claims(*:2030)))|notifications/([^/]++)/mark\\-read(*:2074)|get\\-user\\-credentials/([^/]++)(*:2114)|(.*)(*:2127)))/?$}sDu',
    ),
    3 => 
    array (
      51 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Rj6HVR0ykNjspWcm',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1qDwOlkzGSQALQSD',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9Kt1tgNegPuolPLf',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      68 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::hWKRaJ6Mdr3LAda0',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PATCH' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      95 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::aEDkNLPW7MhL1DLv',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      107 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::w2M88GS07Eoxg7z2',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      122 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::iCHxRCt1QlK2MhPd',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      147 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::notVneOP0a0ltiuG',
          ),
          1 => 
          array (
            0 => 'status',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      188 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::90X6sNdMuA1oMdut',
          ),
          1 => 
          array (
            0 => 'barangay',
            1 => 'status',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      213 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mwMkIeC7nxjO0DsA',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      242 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::H1ZEcVDSdl35p2PI',
          ),
          1 => 
          array (
            0 => 'referenceNumber',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      272 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::DWMFFDCH6Jsjg5KD',
          ),
          1 => 
          array (
            0 => 'applicationId',
            1 => 'fileType',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      307 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gJcBbPRQvhQtqAV5',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      341 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::INcSl2ZtGbr46FPR',
          ),
          1 => 
          array (
            0 => 'applicationId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      377 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BrWUS3QrELvtmWo4',
          ),
          1 => 
          array (
            0 => 'applicationId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      418 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::jV4lrsRwAinnXFB6',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Of2RPlFGI8ZQZ6lO',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      444 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::RPjqxK9FUPvYxSSL',
          ),
          1 => 
          array (
            0 => 'audience',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      463 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::eRyChsRImoIt3xdK',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::pRrUUvoloEK9wiuu',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PATCH' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      510 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ygAvclvPDow45hTV',
          ),
          1 => 
          array (
            0 => 'category',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      546 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::h0FAJvSuT8vaihib',
          ),
          1 => 
          array (
            0 => 'userId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      569 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::4Z5YhG0TKRbKCHUk',
          ),
          1 => 
          array (
            0 => 'action',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      612 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::krj1ZWZKTePQGKKF',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      659 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::kxwUkwMJjXFuMpEF',
          ),
          1 => 
          array (
            0 => 'messageId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      678 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'support-tickets.show',
          ),
          1 => 
          array (
            0 => 'support_ticket',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'support-tickets.update',
          ),
          1 => 
          array (
            0 => 'support_ticket',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'support-tickets.destroy',
          ),
          1 => 
          array (
            0 => 'support_ticket',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      695 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::WL594EZz61o1twbw',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      737 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::aOckK2k0A9dAdhQK',
          ),
          1 => 
          array (
            0 => 'messageId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      775 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Ybe6ypxTtmfQUQ8W',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      818 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::lw0hHKmE08BgINE8',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      844 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::SjSfUmqn9YKDq59J',
          ),
          1 => 
          array (
            0 => 'applicationId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      875 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::t97AXxaCAMvLMzcg',
          ),
          1 => 
          array (
            0 => 'applicationId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      917 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::xVAMqSAekPsCmAsT',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      937 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::maix3P0NlGp5kC4n',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      959 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::DhrTPbQAGlhwuCwt',
          ),
          1 => 
          array (
            0 => 'messageId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      990 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::F8frFTGNvNVDQiPg',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1016 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::JacwCQG435GULsmx',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1025 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'users.show',
          ),
          1 => 
          array (
            0 => 'user',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'users.update',
          ),
          1 => 
          array (
            0 => 'user',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'users.destroy',
          ),
          1 => 
          array (
            0 => 'user',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1066 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9LarYdh7ZvVVzpLU',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1096 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'complaints.show',
          ),
          1 => 
          array (
            0 => 'complaint',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'complaints.update',
          ),
          1 => 
          array (
            0 => 'complaint',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'complaints.destroy',
          ),
          1 => 
          array (
            0 => 'complaint',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1112 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Dtlhkp5KMsG2Yrvx',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PATCH' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1149 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IuphVqBNHZiNQVmc',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1184 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'reports.show',
          ),
          1 => 
          array (
            0 => 'report',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'reports.update',
          ),
          1 => 
          array (
            0 => 'report',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'reports.destroy',
          ),
          1 => 
          array (
            0 => 'report',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1211 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::lQbXjyiRhzq783mU',
          ),
          1 => 
          array (
            0 => 'type',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1250 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::7hXX9BOPnVyglicz',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1270 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::s4tDxaU94kp9qja5',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1309 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::GvnNHdVIRkMMwKST',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1343 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::CnA1p9iVatMORypb',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1383 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::cRjVDVSidOuJQKfV',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1420 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::xoNxrKeidXDa2x37',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1442 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::RBXtluGUPrvmuzqp',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1485 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::pA06VNfUiY5l3sUL',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1520 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::GZO091p9YLs6nbuq',
          ),
          1 => 
          array (
            0 => 'barangay',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1546 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::XSkys8HXJrrCfeOv',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1572 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::eCoaWDmpjfQJ7Jyz',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1604 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mrJwykDyCKCN6BZz',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1640 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::OMLHz4MsIXzkOCaS',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1649 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'benefits.show',
          ),
          1 => 
          array (
            0 => 'benefit',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'benefits.update',
          ),
          1 => 
          array (
            0 => 'benefit',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'benefits.destroy',
          ),
          1 => 
          array (
            0 => 'benefit',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1679 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::fAwQQa75BSilB0zC',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::cE943szaE8ofD5G8',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1710 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::5PPHfLrBrkSrwgM2',
          ),
          1 => 
          array (
            0 => 'benefitId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1726 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::nKoEgqVkWezUN9QS',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PATCH' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1735 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'benefit-claims.show',
          ),
          1 => 
          array (
            0 => 'benefit_claim',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'benefit-claims.update',
          ),
          1 => 
          array (
            0 => 'benefit_claim',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'benefit-claims.destroy',
          ),
          1 => 
          array (
            0 => 'benefit_claim',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1772 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::u0J4VkNa34aaT9PC',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1792 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YAFMwVZHjM4V0gQR',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::oaWkYYnP1pXQLHUV',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1818 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::z0FlJEn4wQXBtvsD',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1842 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1m7F6WyEbIfyFue1',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1864 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::iaSBhTkjFfA2WcEN',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1879 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::AH0IhBVce8GHkoQ5',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1904 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mTaT7IzugucFuRdP',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1927 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::k7A9X67IC3VjgIBI',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1962 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'pwd-members.show',
          ),
          1 => 
          array (
            0 => 'pwd_member',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'pwd-members.update',
          ),
          1 => 
          array (
            0 => 'pwd_member',
          ),
          2 => 
          array (
            'PUT' => 0,
            'PATCH' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => 
          array (
            '_route' => 'pwd-members.destroy',
          ),
          1 => 
          array (
            0 => 'pwd_member',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1987 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::FHoK58ae9ynkFgmb',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2006 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::lePPXfkUclQ7y6gr',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2030 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::pl26qrqrGAPLu5vw',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2074 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::MOwrfB7tUTEv0hN5',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2114 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Sh8uwcqYmklMjaVk',
          ),
          1 => 
          array (
            0 => 'email',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      2127 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::lDBkHzWAx17V8n8q',
          ),
          1 => 
          array (
            0 => 'fallbackPlaceholder',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => NULL,
          1 => NULL,
          2 => NULL,
          3 => NULL,
          4 => false,
          5 => false,
          6 => 0,
        ),
      ),
    ),
    4 => NULL,
  ),
  'attributes' => 
  array (
    'sanctum.csrf-cookie' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'sanctum/csrf-cookie',
      'action' => 
      array (
        'uses' => 'Laravel\\Sanctum\\Http\\Controllers\\CsrfCookieController@show',
        'controller' => 'Laravel\\Sanctum\\Http\\Controllers\\CsrfCookieController@show',
        'namespace' => NULL,
        'prefix' => 'sanctum',
        'where' => 
        array (
        ),
        'middleware' => 
        array (
          0 => 'web',
        ),
        'as' => 'sanctum.csrf-cookie',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mxCQc94noSGh1XLq' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-direct',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:322:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:106:"function () {
                return response()->json([\'message\' => \'Direct route test\']);
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006980000000000000000";}";s:4:"hash";s:44:"xZ+FZYiGxcrX6JqENwCXC5kGrWusOSoEvbmMFAtoOr4=";}}',
        'as' => 'generated::mxCQc94noSGh1XLq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::HhVUf7gG4WJeD8yG' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/login',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuthController@login',
        'controller' => 'App\\Http\\Controllers\\API\\AuthController@login',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::HhVUf7gG4WJeD8yG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::orvf0SDyBxZnrMOz' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/applications/dashboard/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:3227:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:3010:"function (\\Illuminate\\Http\\Request $request) {
                try {
                    // Get the authenticated user
                    $user = $request->user();
                    $barangay = \'Barangay Poblacion\'; // Default
                    
                    if ($user && $user->role === \'BarangayPresident\') {
                        // Load the barangay president relationship
                        try {
                            $user->load(\'barangayPresident\');
                            if ($user->barangayPresident && $user->barangayPresident->barangay) {
                                $barangay = $user->barangayPresident->barangay;
                            }
                        } catch (\\Exception $e) {
                            // Handle missing barangay_president table gracefully
                            \\Log::warning(\'Barangay president table not available: \' . $e->getMessage());
                            // Extract barangay from username (e.g., bp_mamatid -> Mamatid)
                            if (strpos($user->username, \'bp_\') === 0) {
                                $barangayName = str_replace(\'bp_\', \'\', $user->username);
                                $barangayName = str_replace(\'_\', \' \', $barangayName);
                                $barangayName = ucwords(strtolower($barangayName));
                                $barangay = $barangayName; // Use just the barangay name, not "Barangay " prefix
                            }
                        }
                    }
                    
                    // Filter applications by barangay
                    $query = \\App\\Models\\Application::where(\'barangay\', $barangay);
                    
                    $stats = [
                        \'totalApplications\' => $query->count(),
                        \'pendingApplications\' => $query->where(\'status\', \'Pending Barangay Approval\')->count(),
                        \'approvedApplications\' => $query->where(\'status\', \'Approved\')->count(),
                        \'rejectedApplications\' => $query->where(\'status\', \'Rejected\')->count(),
                        \'pendingAdminApproval\' => $query->where(\'status\', \'Pending Admin Approval\')->count(),
                        \'barangay\' => $barangay
                    ];
                    
                    return response()->json($stats);
                } catch (\\Exception $e) {
                    // Fallback to mock data if there\'s an error
                    return response()->json([
                        \'totalApplications\' => 0,
                        \'pendingApplications\' => 0,
                        \'approvedApplications\' => 0,
                        \'rejectedApplications\' => 0,
                        \'pendingAdminApproval\' => 0,
                        \'barangay\' => \'Barangay Poblacion\',
                        \'error\' => $e->getMessage()
                    ]);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000069c0000000000000000";}";s:4:"hash";s:44:"2DSB3gq7GebNfDQ8dtyXd26zHc8Rl3hAmQDi1I5QFRc=";}}',
        'as' => 'generated::orvf0SDyBxZnrMOz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::w0yrZD5pM4Z6V3Jr' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/applications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:529:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:310:"function () {
    try {
        $applications = \\App\\Models\\Application::all();
        
        return \\response()->json($applications);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'success\' => false,
            \'error\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006d50000000000000000";}";s:4:"hash";s:44:"16nbWFPw3lyjhSxNCgn3ePwX82jCKq/y4S+VKl6DuHE=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::w0yrZD5pM4Z6V3Jr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Rj6HVR0ykNjspWcm' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/applications/{id}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:559:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:343:"function ($id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    return response()->json($application);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Application not found\'], 404);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000069f0000000000000000";}";s:4:"hash";s:44:"9e34jY8fodWb3T21gEeSlEOwuDZGTTLwGdLq/KhKMGc=";}}',
        'as' => 'generated::Rj6HVR0ykNjspWcm',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1qDwOlkzGSQALQSD' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/applications/{id}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:661:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:445:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    $application->update($request->all());
                    return response()->json($application);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to update application\'], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006a10000000000000000";}";s:4:"hash";s:44:"b2RpyKklxRg2TtnkF1SEmUUdS74ZKvAM+DsRqmjI5f8=";}}',
        'as' => 'generated::1qDwOlkzGSQALQSD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9Kt1tgNegPuolPLf' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/applications/{id}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:648:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:432:"function ($id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    $application->delete();
                    return response()->json([\'message\' => \'Application deleted successfully\']);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to delete application\'], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006a30000000000000000";}";s:4:"hash";s:44:"1FnPD/+zUNK6MPcarEXLfDeZ0q9GjpLFMMeiNj1B6ZM=";}}',
        'as' => 'generated::9Kt1tgNegPuolPLf',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hWKRaJ6Mdr3LAda0' => 
    array (
      'methods' => 
      array (
        0 => 'PATCH',
      ),
      'uri' => 'api/applications/{id}/status',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:788:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:572:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    $application->update([
                        \'status\' => $request->status,
                        \'remarks\' => $request->remarks
                    ]);
                    return response()->json($application);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to update application status\'], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006a50000000000000000";}";s:4:"hash";s:44:"sdsvN8cpmdOHAvCLg4YiYzBjmy1oIOEu5crhC/y7bGU=";}}',
        'as' => 'generated::hWKRaJ6Mdr3LAda0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::aEDkNLPW7MhL1DLv' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/applications/{id}/approve-barangay',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1571:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1354:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    
                    $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
                        \'remarks\' => \'nullable|string|max:500\',
                    ]);

                    if ($validator->fails()) {
                        return response()->json([
                            \'error\' => \'Validation failed\',
                            \'messages\' => $validator->errors()
                        ], 422);
                    }

                    $application->update([
                        \'status\' => \'Pending Admin Approval\',
                        \'remarks\' => $request->remarks || \'Approved by Barangay President\'
                    ]);

                    return response()->json([
                        \'message\' => \'Application approved successfully\',
                        \'application\' => $application
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to approve application\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006a80000000000000000";}";s:4:"hash";s:44:"OFvTM4rBPb7425H2fYqjpRgl9CvC67iwl9IpuUvK8c8=";}}',
        'as' => 'generated::aEDkNLPW7MhL1DLv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iCHxRCt1QlK2MhPd' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/applications/{id}/reject',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1520:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1303:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    
                    $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
                        \'remarks\' => \'required|string|max:500\',
                    ]);

                    if ($validator->fails()) {
                        return response()->json([
                            \'error\' => \'Validation failed\',
                            \'messages\' => $validator->errors()
                        ], 422);
                    }

                    $application->update([
                        \'status\' => \'Rejected\',
                        \'remarks\' => $request->remarks
                    ]);

                    return response()->json([
                        \'message\' => \'Application rejected successfully\',
                        \'application\' => $application
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to reject application\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006aa0000000000000000";}";s:4:"hash";s:44:"2LeaeqIWokv+QZ38YntWZvh8nroDyn/1Z/tFPvoOdpY=";}}',
        'as' => 'generated::iCHxRCt1QlK2MhPd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4c6CRkTwdJMM1aQi' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/admin/dashboard/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2270:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2053:"function (\\Illuminate\\Http\\Request $request) {
                try {
                    $user = $request->user();
                    
                    // Only allow admin users
                    if ($user->role !== \'Admin\') {
                        return response()->json([\'error\' => \'Unauthorized\'], 403);
                    }
                    
                    // Get all applications across all barangays
                    $totalApplications = \\App\\Models\\Application::count();
                    $pendingBarangayApproval = \\App\\Models\\Application::where(\'status\', \'Pending Barangay Approval\')->count();
                    $pendingAdminApproval = \\App\\Models\\Application::where(\'status\', \'Pending Admin Approval\')->count();
                    $approvedApplications = \\App\\Models\\Application::where(\'status\', \'Approved\')->count();
                    $rejectedApplications = \\App\\Models\\Application::where(\'status\', \'Rejected\')->count();
                    
                    return response()->json([
                        \'totalApplications\' => $totalApplications,
                        \'pendingBarangayApproval\' => $pendingBarangayApproval,
                        \'pendingAdminApproval\' => $pendingAdminApproval,
                        \'approvedApplications\' => $approvedApplications,
                        \'rejectedApplications\' => $rejectedApplications,
                        \'totalRegisteredPWDs\' => $approvedApplications, // Same as approved applications
                        \'unclaimedPWDCards\' => $approvedApplications, // Assuming all approved need cards
                        \'complaintsFeedback\' => 0 // Placeholder - would need separate table
                    ]);
                    
                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to fetch admin dashboard stats\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006ac0000000000000000";}";s:4:"hash";s:44:"1Q/YfthruKT1CBQmEUIemsHxLUHF0c2xrWBu9WIL41o=";}}',
        'as' => 'generated::4c6CRkTwdJMM1aQi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jzmuqo6KVM00fRuB' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/announcements',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@index',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::jzmuqo6KVM00fRuB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::E2u1ormUG3N8dGYb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/announcements/admin',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@getAdminAnnouncements',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@getAdminAnnouncements',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::E2u1ormUG3N8dGYb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4WDIh6vTQnh3bGDB' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/announcements',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@store',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::4WDIh6vTQnh3bGDB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jV4lrsRwAinnXFB6' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/announcements/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@update',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::jV4lrsRwAinnXFB6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Of2RPlFGI8ZQZ6lO' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/announcements/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Of2RPlFGI8ZQZ6lO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::RPjqxK9FUPvYxSSL' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/announcements/audience/{audience}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@getByAudience',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@getByAudience',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::RPjqxK9FUPvYxSSL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XtfrinY56HqWRNTJ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/support/tickets',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:4059:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:3842:"function () {
                try {
                    // Mock support tickets data
                    $tickets = [
                        [
                            \'id\' => 1,
                            \'ticketNumber\' => \'SUP-001\',
                            \'subject\' => \'PWD Card Application Issue\',
                            \'description\' => \'I submitted my PWD card application 2 weeks ago but haven\\\'t received any updates. Can you please check the status?\',
                            \'requester\' => \'John Doe\',
                            \'email\' => \'john.doe@email.com\',
                            \'phone\' => \'+63 912 345 6789\',
                            \'status\' => \'Open\',
                            \'priority\' => \'High\',
                            \'category\' => \'PWD Card\',
                            \'createdAt\' => \'2025-09-01\',
                            \'updatedAt\' => \'2025-09-05\',
                            \'replies\' => [
                                [
                                    \'id\' => 1,
                                    \'message\' => \'Thank you for contacting us. We have received your application and it is currently under review.\',
                                    \'author\' => \'Admin\',
                                    \'createdAt\' => \'2025-09-02\'
                                ]
                            ]
                        ],
                        [
                            \'id\' => 2,
                            \'ticketNumber\' => \'SUP-002\',
                            \'subject\' => \'Benefits Information Request\',
                            \'description\' => \'I would like to know what benefits are available for PWD members in our barangay.\',
                            \'requester\' => \'Maria Santos\',
                            \'email\' => \'maria.santos@email.com\',
                            \'phone\' => \'+63 987 654 3210\',
                            \'status\' => \'In Progress\',
                            \'priority\' => \'Medium\',
                            \'category\' => \'Benefits\',
                            \'createdAt\' => \'2025-09-03\',
                            \'updatedAt\' => \'2025-09-04\',
                            \'replies\' => []
                        ],
                        [
                            \'id\' => 3,
                            \'ticketNumber\' => \'SUP-003\',
                            \'subject\' => \'Account Login Problem\',
                            \'description\' => \'I cannot log into my PWD member account. It says invalid credentials.\',
                            \'requester\' => \'Pedro Cruz\',
                            \'email\' => \'pedro.cruz@email.com\',
                            \'phone\' => \'+63 923 456 7890\',
                            \'status\' => \'Resolved\',
                            \'priority\' => \'High\',
                            \'category\' => \'Technical\',
                            \'createdAt\' => \'2025-08-28\',
                            \'updatedAt\' => \'2025-08-30\',
                            \'replies\' => [
                                [
                                    \'id\' => 1,
                                    \'message\' => \'We have reset your password and sent new login credentials to your email.\',
                                    \'author\' => \'Admin\',
                                    \'createdAt\' => \'2025-08-29\'
                                ]
                            ]
                        ]
                    ];
                    
                    return response()->json($tickets);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to fetch support tickets\', \'message\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006b90000000000000000";}";s:4:"hash";s:44:"xgdULUii3fZuzhuHKnLrDygW561w1SQUoha2pivYgcU=";}}',
        'as' => 'generated::XtfrinY56HqWRNTJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::RcghXejI6PFL4ofi' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/support/tickets',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2331:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2114:"function (\\Illuminate\\Http\\Request $request) {
                try {
                    $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
                        \'subject\' => \'required|string|max:255\',
                        \'description\' => \'required|string\',
                        \'requester\' => \'required|string|max:255\',
                        \'email\' => \'required|email|max:255\',
                        \'phone\' => \'required|string|max:20\',
                        \'category\' => \'required|string|in:PWD Card,Benefits,Technical,General\',
                        \'priority\' => \'required|string|in:Low,Medium,High\'
                    ]);

                    if ($validator->fails()) {
                        return response()->json([\'error\' => \'Validation failed\', \'messages\' => $validator->errors()], 400);
                    }

                    // Generate ticket number
                    $ticketNumber = \'SUP-\' . str_pad(rand(1, 9999), 4, \'0\', STR_PAD_LEFT);
                    
                    $ticket = [
                        \'id\' => rand(100, 999),
                        \'ticketNumber\' => $ticketNumber,
                        \'subject\' => $request->subject,
                        \'description\' => $request->description,
                        \'requester\' => $request->requester,
                        \'email\' => $request->email,
                        \'phone\' => $request->phone,
                        \'status\' => \'Open\',
                        \'priority\' => $request->priority,
                        \'category\' => $request->category,
                        \'createdAt\' => now()->toDateString(),
                        \'updatedAt\' => now()->toDateString(),
                        \'replies\' => []
                    ];
                    
                    return response()->json($ticket, 201);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to create support ticket\', \'message\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006bb0000000000000000";}";s:4:"hash";s:44:"fXmUZD76OymosOrZwF38UjJryCbbg0it8am3CkmQ1+c=";}}',
        'as' => 'generated::RcghXejI6PFL4ofi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::krj1ZWZKTePQGKKF' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/support/tickets/{id}/reply',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1212:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:996:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
                        \'message\' => \'required|string\'
                    ]);

                    if ($validator->fails()) {
                        return response()->json([\'error\' => \'Validation failed\', \'messages\' => $validator->errors()], 400);
                    }

                    $reply = [
                        \'id\' => rand(1, 999),
                        \'message\' => $request->message,
                        \'author\' => \'Admin\',
                        \'createdAt\' => now()->toDateString()
                    ];
                    
                    return response()->json($reply, 201);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to add reply\', \'message\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006bd0000000000000000";}";s:4:"hash";s:44:"/9n228boTjZBGjX6BYAvvlUn9sOGwy6pARzDfAAqQXM=";}}',
        'as' => 'generated::krj1ZWZKTePQGKKF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::D1F6kESRDQVYVN4x' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-member/profile',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1670:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1450:"function (\\Illuminate\\Http\\Request $request) {
    try {
        $user = $request->user();
        if (!$user || $user->role !== \'PWDMember\') {
            return \\response()->json([\'error\' => \'Unauthorized\'], 401);
        }
        
        $pwdMember = $user->pwdMember;
        if (!$pwdMember) {
            return \\response()->json([\'error\' => \'PWD Member not found\'], 404);
        }
        
        // Get barangay from approved application
        $approvedApplication = $pwdMember->applications()
            ->where(\'status\', \'Approved\')
            ->latest()
            ->first();
        
        $profile = [
            \'userID\' => $user->userID,
            \'firstName\' => $pwdMember->firstName,
            \'lastName\' => $pwdMember->lastName,
            \'email\' => $user->email,
            \'contactNumber\' => $pwdMember->contactNumber,
            \'address\' => $pwdMember->address,
            \'birthDate\' => $pwdMember->birthDate,
            \'gender\' => $pwdMember->gender,
            \'disabilityType\' => $pwdMember->disabilityType,
            \'pwd_id\' => $pwdMember->pwd_id,
            \'barangay\' => $approvedApplication ? $approvedApplication->barangay : null,
            \'created_at\' => $pwdMember->created_at,
        ];
        
        return \\response()->json($profile);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007190000000000000000";}";s:4:"hash";s:44:"IWeZc2MbaAaUUAWL2kj7X28JVMc0+QSCc509SYovtAA=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::D1F6kESRDQVYVN4x',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QBg34j4s0X3Uf4mq' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/pwd-member/profile',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2027:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1807:"function (\\Illuminate\\Http\\Request $request) {
    try {
        $user = $request->user();
        if (!$user || $user->role !== \'PWDMember\') {
            return \\response()->json([\'error\' => \'Unauthorized\'], 401);
        }
        
        $pwdMember = $user->pwdMember;
        if (!$pwdMember) {
            return \\response()->json([\'error\' => \'PWD Member not found\'], 404);
        }
        
        $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
            \'firstName\' => \'required|string|max:50\',
            \'lastName\' => \'required|string|max:50\',
            \'email\' => \'required|email\',
            \'contactNumber\' => \'required|string|max:20\',
            \'address\' => \'required|string\',
            \'birthDate\' => \'required|date\',
            \'gender\' => \'required|string\',
            \'disabilityType\' => \'required|string\',
        ]);
        
        if ($validator->fails()) {
            return \\response()->json([\'error\' => \'Validation failed\', \'messages\' => $validator->errors()], 422);
        }
        
        // Update user email
        $user->update([\'email\' => $request->email]);
        
        // Update PWD member data
        $pwdMember->update([
            \'firstName\' => $request->firstName,
            \'lastName\' => $request->lastName,
            \'contactNumber\' => $request->contactNumber,
            \'address\' => $request->address,
            \'birthDate\' => $request->birthDate,
            \'gender\' => $request->gender,
            \'disabilityType\' => $request->disabilityType,
        ]);
        
        return \\response()->json([\'message\' => \'Profile updated successfully\']);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006c10000000000000000";}";s:4:"hash";s:44:"KS/CPXUJAO1P8Vdhi6PUOxhW+x4aR9EiCnwtw9XK6sA=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::QBg34j4s0X3Uf4mq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SMGFwc5FCWmVJ3dc' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/pwd-member/change-password',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1561:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1341:"function (\\Illuminate\\Http\\Request $request) {
        try {
            $user = $request->user();
            if (!$user || $user->role !== \'PWDMember\') {
                return \\response()->json([\'error\' => \'Unauthorized\'], 401);
            }
            
            $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
                \'currentPassword\' => \'required\',
                \'newPassword\' => \'required|min:6\',
            ]);
            
            if ($validator->fails()) {
                return \\response()->json([\'error\' => \'Validation failed\', \'messages\' => $validator->errors()], 422);
            }
            
            // Verify current password
            if (!\\Illuminate\\Support\\Facades\\Hash::check($request->currentPassword, $user->password)) {
                return \\response()->json([\'error\' => \'Current password is incorrect\'], 400);
            }
            
            // Update password
            $user->update([
                \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($request->newPassword)
            ]);
            
            return \\response()->json([\'message\' => \'Password changed successfully\']);
        } catch (\\Exception $e) {
            return \\response()->json([\'error\' => $e->getMessage()], 500);
        }
    }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007390000000000000000";}";s:4:"hash";s:44:"6bpxB7RBFueFHkOTUD4uALDq0K9qRm6kRVcjl08oTBE=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::SMGFwc5FCWmVJ3dc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bQo3dC6Dksp8uqvb' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reset-password',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1667:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1450:"function (\\Illuminate\\Http\\Request $request) {
                try {
                    $request->validate([
                        \'email\' => \'required|email\',
                        \'newPassword\' => \'required|min:6\',
                        \'confirmPassword\' => \'required|same:newPassword\'
                    ]);
                    
                    $user = \\App\\Models\\User::where(\'email\', $request->email)->first();
                    if (!$user) {
                        return response()->json([\'error\' => \'User not found\'], 404);
                    }
                    
                    // Update password
                    $user->update([
                        \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($request->newPassword)
                    ]);
                    
                    return response()->json([
                        \'message\' => \'Password reset successfully\',
                        \'email\' => $user->email,
                        \'role\' => $user->role
                    ]);
                } catch (\\Illuminate\\Validation\\ValidationException $e) {
                    return response()->json([\'error\' => \'Validation failed\', \'errors\' => $e->errors()], 422);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to reset password\', \'message\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006bf0000000000000000";}";s:4:"hash";s:44:"itxET3KRCEs+wrfj/vg6gdOoq2I6sP4fiLo9c5zkFbs=";}}',
        'as' => 'generated::bQo3dC6Dksp8uqvb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XmF3HVuoPdSwMmF0' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/change-password',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuthController@changePassword',
        'controller' => 'App\\Http\\Controllers\\API\\AuthController@changePassword',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::XmF3HVuoPdSwMmF0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UKRUV5TYSvJrFwx8' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/admin/reset-user-password',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1877:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1660:"function (\\Illuminate\\Http\\Request $request) {
                try {
                    $request->validate([
                        \'email\' => \'required|email\',
                        \'newPassword\' => \'required|min:6\'
                    ]);
                    
                    $admin = auth()->user();
                    if (!$admin || $admin->role !== \'SuperAdmin\') {
                        return response()->json([\'error\' => \'SuperAdmin access required\'], 403);
                    }
                    
                    $user = \\App\\Models\\User::where(\'email\', $request->email)->first();
                    if (!$user) {
                        return response()->json([\'error\' => \'User not found\'], 404);
                    }
                    
                    // Update password
                    $user->update([
                        \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($request->newPassword)
                    ]);
                    
                    return response()->json([
                        \'message\' => \'User password reset successfully\',
                        \'email\' => $user->email,
                        \'role\' => $user->role
                    ]);
                    
                } catch (\\Illuminate\\Validation\\ValidationException $e) {
                    return response()->json([\'error\' => \'Validation failed\', \'errors\' => $e->errors()], 422);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => \'Failed to reset password\', \'message\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006c90000000000000000";}";s:4:"hash";s:44:"aQHz5Bo5PzcO8haRin9XyePLsG6sBUMWFUBH0mhqmuU=";}}',
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'as' => 'generated::UKRUV5TYSvJrFwx8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ybe6ypxTtmfQUQ8W' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-pwd-login/{email}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1612:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1395:"function ($email) {
                try {
                    $user = \\App\\Models\\User::where(\'email\', $email)->first();
                    if (!$user) {
                        return response()->json([\'error\' => \'User not found\'], 404);
                    }
                    
                    $pwdMember = \\App\\Models\\PWDMember::where(\'userID\', $user->userID)->first();
                    
                    return response()->json([
                        \'user\' => [
                            \'userID\' => $user->userID,
                            \'username\' => $user->username,
                            \'email\' => $user->email,
                            \'role\' => $user->role,
                            \'status\' => $user->status,
                            \'created_at\' => $user->created_at
                        ],
                        \'pwdMember\' => $pwdMember ? [
                            \'id\' => $pwdMember->id,
                            \'firstName\' => $pwdMember->firstName,
                            \'lastName\' => $pwdMember->lastName,
                            \'disabilityType\' => $pwdMember->disabilityType
                        ] : null
                    ]);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006cb0000000000000000";}";s:4:"hash";s:44:"b7zpHfkKu+Lx0WDLy9NDdv7tWA4bkCKAcg9n/xI4SUo=";}}',
        'as' => 'generated::Ybe6ypxTtmfQUQ8W',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lw0hHKmE08BgINE8' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/test-approve-application/{id}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:6169:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:5952:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($id);
                    
                    // Create a password setup token instead of generating a password
                    $passwordSetupToken = base64_encode(json_encode([
                        \'email\' => $application->email,
                        \'ts\' => time()
                    ]));
                    
                    // Check if user already exists
                    $existingUser = \\App\\Models\\User::where(\'email\', $application->email)->first();
                    
                    if ($existingUser) {
                        // User already exists, update their role to PWDMember (keep password unchanged until user sets it)
                        $existingUser->update([
                            \'role\' => \'PWDMember\',
                            \'status\' => \'active\'
                        ]);
                        $pwdUser = $existingUser;
                    } else {
                        // Create new PWD Member User Account
                        $pwdUser = \\App\\Models\\User::create([
                            \'username\' => $application->email, // Use email as username
                            \'email\' => $application->email,
                            // Set a temporary random password; user will replace via reset link
                            \'password\' => \\Illuminate\\Support\\Facades\\Hash::make(\\Illuminate\\Support\\Str::random(20)),
                            \'role\' => \'PWDMember\',
                            \'status\' => \'active\',
                            \'password_change_required\' => true
                        ]);
                    }

                    // Generate unique PWD ID
                    $pwdId = \\App\\Services\\PWDIdGenerator::generate();
                    
                    // Create or update PWD Member Record
                    $existingPwdMember = \\App\\Models\\PWDMember::where(\'userID\', $pwdUser->userID)->first();
                    
                    if ($existingPwdMember) {
                        // Update existing PWD Member record
                        $existingPwdMember->update([
                            \'pwd_id\' => $pwdId,
                            \'pwd_id_generated_at\' => now(),
                            \'firstName\' => $application->firstName,
                            \'lastName\' => $application->lastName,
                            \'middleName\' => $application->middleName,
                            \'birthDate\' => $application->birthDate,
                            \'gender\' => $application->gender,
                            \'disabilityType\' => $application->disabilityType,
                            \'address\' => $application->address,
                            \'barangay\' => $application->barangay,
                            \'contactNumber\' => $application->contactNumber,
                            \'email\' => $application->email,
                            \'emergencyContact\' => $application->emergencyContact,
                            \'emergencyPhone\' => $application->emergencyPhone,
                            \'emergencyRelationship\' => $application->emergencyRelationship
                        ]);
                        $pwdMember = $existingPwdMember;
                    } else {
                        // Create new PWD Member Record
                        $pwdMember = \\App\\Models\\PWDMember::create([
                            \'userID\' => $pwdUser->userID,
                            \'pwd_id\' => $pwdId,
                            \'pwd_id_generated_at\' => now(),
                            \'firstName\' => $application->firstName,
                            \'lastName\' => $application->lastName,
                            \'middleName\' => $application->middleName,
                            \'birthDate\' => $application->birthDate,
                            \'gender\' => $application->gender,
                            \'disabilityType\' => $application->disabilityType,
                            \'address\' => $application->address,
                            \'barangay\' => $application->barangay,
                            \'contactNumber\' => $application->contactNumber,
                            \'email\' => $application->email,
                            \'emergencyContact\' => $application->emergencyContact,
                            \'emergencyPhone\' => $application->emergencyPhone,
                            \'emergencyRelationship\' => $application->emergencyRelationship
                        ]);
                    }

                    // Update application status
                    $application->update([
                        \'status\' => \'Approved\',
                        \'remarks\' => \'Approved by Test Route\',
                        \'pwdID\' => $pwdUser->userID
                    ]);

                    return response()->json([
                        \'message\' => \'Application approved successfully. PWD Member account created.\',
                        \'application\' => $application,
                        \'pwdUser\' => [
                            \'userID\' => $pwdUser->userID,
                            \'pwdId\' => $pwdId,
                            \'email\' => $pwdUser->email,
                            \'password\' => $randomPassword
                        ],
                        \'pwdMember\' => $pwdMember
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to approve application\',
                        \'message\' => $e->getMessage(),
                        \'trace\' => $e->getTraceAsString()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006cd0000000000000000";}";s:4:"hash";s:44:"kwwFIrYq5kXmuyKY2Oxv/bcsiJlC0hPQCI9y4+tCdmc=";}}',
        'as' => 'generated::lw0hHKmE08BgINE8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::N117Op3xGEbhup2M' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-pwd-creation',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1805:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1588:"function () {
                try {
                    // Test User creation
                    $user = \\App\\Models\\User::create([
                        \'username\' => \'test@example.com\',
                        \'email\' => \'test@example.com\',
                        \'password\' => \\Illuminate\\Support\\Facades\\Hash::make(\\Illuminate\\Support\\Str::random(12)),
                        \'role\' => \'PWDMember\',
                        \'status\' => \'active\'
                    ]);
                    
                    // Test PWDMember creation
                    $pwdMember = \\App\\Models\\PWDMember::create([
                        \'userID\' => $user->userID,
                        \'firstName\' => \'Test\',
                        \'lastName\' => \'User\',
                        \'birthDate\' => \'1990-01-01\',
                        \'gender\' => \'Male\',
                        \'disabilityType\' => \'Physical\',
                        \'address\' => \'Test Address\'
                    ]);
                    
                    return response()->json([
                        \'message\' => \'Test successful\',
                        \'user\' => $user,
                        \'pwdMember\' => $pwdMember
                    ]);
                    
                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Test failed\',
                        \'message\' => $e->getMessage(),
                        \'trace\' => $e->getTraceAsString()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006cf0000000000000000";}";s:4:"hash";s:44:"+m00nyVjPuGjD3BQSMnqTbls0SiG7QPRnRmiCy7j+AI=";}}',
        'as' => 'generated::N117Op3xGEbhup2M',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::w2M88GS07Eoxg7z2' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/applications/{id}/approve-admin',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:9219:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:9002:"function (\\Illuminate\\Http\\Request $request, $id) {
                try {
                    $user = $request->user();
                    
                    // Only allow admin users
                    if ($user->role !== \'Admin\') {
                        return response()->json([\'error\' => \'Unauthorized\'], 403);
                    }
                    
                    $application = \\App\\Models\\Application::findOrFail($id);
                    
                    $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
                        \'remarks\' => \'nullable|string|max:500\',
                    ]);

                    if ($validator->fails()) {
                        return response()->json([
                            \'error\' => \'Validation failed\',
                            \'messages\' => $validator->errors()
                        ], 422);
                    }

                    // Generate fixed password for testing
                    $randomPassword = \\Illuminate\\Support\\Str::random(12);
                    
                    // Check if user already exists
                    $existingUser = \\App\\Models\\User::where(\'email\', $application->email)->first();
                    
                    if ($existingUser) {
                        // User already exists, update their role to PWDMember and password
                        $existingUser->update([
                            \'role\' => \'PWDMember\',
                            \'status\' => \'active\',
                            \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword)
                        ]);
                        $pwdUser = $existingUser;
                    } else {
                        // Create new PWD Member User Account
                        $pwdUser = \\App\\Models\\User::create([
                            \'username\' => $application->email, // Use email as username
                            \'email\' => $application->email,
                            \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword),
                            \'role\' => \'PWDMember\',
                            \'status\' => \'active\',
                            \'password_change_required\' => true
                        ]);
                    }

                    // Generate unique PWD ID
                    $pwdId = \\App\\Services\\PWDIdGenerator::generate();
                    
                    // Create or update PWD Member Record
                    $existingPwdMember = \\App\\Models\\PWDMember::where(\'userID\', $pwdUser->userID)->first();
                    
                    if ($existingPwdMember) {
                        // Update existing PWD Member record
                        $existingPwdMember->update([
                            \'pwd_id\' => $pwdId,
                            \'pwd_id_generated_at\' => now(),
                            \'firstName\' => $application->firstName,
                            \'lastName\' => $application->lastName,
                            \'middleName\' => $application->middleName,
                            \'birthDate\' => $application->birthDate,
                            \'gender\' => $application->gender,
                            \'disabilityType\' => $application->disabilityType,
                            \'address\' => $application->address,
                            \'barangay\' => $application->barangay,
                            \'contactNumber\' => $application->contactNumber,
                            \'email\' => $application->email,
                            \'emergencyContact\' => $application->emergencyContact,
                            \'emergencyPhone\' => $application->emergencyPhone,
                            \'emergencyRelationship\' => $application->emergencyRelationship
                        ]);
                        $pwdMember = $existingPwdMember;
                    } else {
                        // Create new PWD Member Record
                        $pwdMember = \\App\\Models\\PWDMember::create([
                            \'userID\' => $pwdUser->userID,
                            \'pwd_id\' => $pwdId,
                            \'pwd_id_generated_at\' => now(),
                            \'firstName\' => $application->firstName,
                            \'lastName\' => $application->lastName,
                            \'middleName\' => $application->middleName,
                            \'birthDate\' => $application->birthDate,
                            \'gender\' => $application->gender,
                            \'disabilityType\' => $application->disabilityType,
                            \'address\' => $application->address,
                            \'barangay\' => $application->barangay,
                            \'contactNumber\' => $application->contactNumber,
                            \'email\' => $application->email,
                            \'emergencyContact\' => $application->emergencyContact,
                            \'emergencyPhone\' => $application->emergencyPhone,
                            \'emergencyRelationship\' => $application->emergencyRelationship
                        ]);
                    }

                    // Generate QR code data after PWD member creation/update
                    try {
                        $qrData = \\App\\Services\\QRCodeGenerator::generateAndStore($pwdMember);
                        \\Illuminate\\Support\\Facades\\Log::info("QR code generated for PWD member: {$pwdId}");
                    } catch (\\Exception $qrError) {
                        // Log QR generation error but don\'t fail the approval
                        \\Illuminate\\Support\\Facades\\Log::error(\'QR code generation failed: \' . $qrError->getMessage());
                    }

                    // Update application status
                    $application->update([
                        \'status\' => \'Approved\',
                        \'remarks\' => $request->remarks || \'Approved by Admin\',
                        \'pwdID\' => $pwdUser->userID
                    ]);

                    // Send email notification with password setup link
                    try {
                        $emailService = new \\App\\Services\\EmailService();
                        $emailSent = $emailService->sendApplicationApprovalEmail([
                            \'firstName\' => $application->firstName,
                            \'lastName\' => $application->lastName,
                            \'email\' => $application->email,
                            \'username\' => $pwdUser->username,
                            \'password\' => $randomPassword,
                            \'pwdId\' => $pwdId,
                            // Frontend route where member can set their password
                            \'loginUrl\' => (config(\'app.frontend_url\', \'http://localhost:3000\') . \'/reset-password?email=\' . urlencode($application->email))
                        ]);

                        if ($emailSent) {
                            \\Illuminate\\Support\\Facades\\Log::info(\'Application approval email sent successfully via Gmail API\', [
                                \'email\' => $application->email,
                                \'pwdId\' => $pwdId,
                                \'from\' => \'sarinonhoelivan29@gmail.com\'
                            ]);
                        } else {
                            \\Illuminate\\Support\\Facades\\Log::warning(\'Failed to send application approval email\', [
                                \'email\' => $application->email,
                                \'pwdId\' => $pwdId,
                                \'from\' => \'sarinonhoelivan29@gmail.com\'
                            ]);
                        }
                    } catch (\\Exception $mailError) {
                        // Log email error but don\'t fail the approval
                        \\Illuminate\\Support\\Facades\\Log::error(\'Email sending failed: \' . $mailError->getMessage());
                    }

                    return response()->json([
                        \'message\' => \'Application approved successfully. PWD Member account created and email sent.\',
                        \'application\' => $application,
                        \'pwdUser\' => [
                            \'userID\' => $pwdUser->userID,
                            \'pwdId\' => $pwdId,
                            \'email\' => $pwdUser->email,
                            \'password\' => $randomPassword
                        ]
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to approve application\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006d20000000000000000";}";s:4:"hash";s:44:"vAzQl7M58W+jkYriOG2+eOyCRxHxqNhS5GASPKkNt3s=";}}',
        'as' => 'generated::w2M88GS07Eoxg7z2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::notVneOP0a0ltiuG' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/applications/status/{status}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:574:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:355:"function ($status) {
    try {
        $applications = \\App\\Models\\Application::where(\'status\', \\urldecode($status))->get();
        
        return \\response()->json($applications);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'success\' => false,
            \'error\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006e50000000000000000";}";s:4:"hash";s:44:"facCJaqRtv6wwQGf/w08IS9v/z19GsBd+pMp09gGPzE=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::notVneOP0a0ltiuG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::JacwCQG435GULsmx' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/users/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => '\\App\\Http\\Controllers\\API\\UserController@show',
        'controller' => '\\App\\Http\\Controllers\\API\\UserController@show',
        'as' => 'generated::JacwCQG435GULsmx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::90X6sNdMuA1oMdut' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/applications/barangay/{barangay}/status/{status}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1019:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:803:"function (\\Illuminate\\Http\\Request $request, $barangay, $status) {
                try {
                    $decodedBarangay = urldecode($barangay);
                    $decodedStatus = urldecode($status);
                    
                    $query = \\App\\Models\\Application::where(\'barangay\', $decodedBarangay);
                    
                    if ($decodedStatus !== \'all\') {
                        $query->where(\'status\', $decodedStatus);
                    }
                    
                    $applications = $query->get();
                    
                    return response()->json($applications);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006d70000000000000000";}";s:4:"hash";s:44:"lyzNhqEUn88a2WCiEHIVM23I7bdOTR2TMSTIAxNIf14=";}}',
        'as' => 'generated::90X6sNdMuA1oMdut',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::3pCcNKxuDg5Kdh94' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/language/change',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\LanguageController@changeLanguage',
        'controller' => 'App\\Http\\Controllers\\LanguageController@changeLanguage',
        'namespace' => NULL,
        'prefix' => 'api/language',
        'where' => 
        array (
        ),
        'as' => 'generated::3pCcNKxuDg5Kdh94',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::goVACxhadlFiXAZ4' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/language/current',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\LanguageController@getCurrentLanguage',
        'controller' => 'App\\Http\\Controllers\\LanguageController@getCurrentLanguage',
        'namespace' => NULL,
        'prefix' => 'api/language',
        'where' => 
        array (
        ),
        'as' => 'generated::goVACxhadlFiXAZ4',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PkAlRqpte7wZ5bc0' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/language/supported',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\LanguageController@getSupportedLanguages',
        'controller' => 'App\\Http\\Controllers\\LanguageController@getSupportedLanguages',
        'namespace' => NULL,
        'prefix' => 'api/language',
        'where' => 
        array (
        ),
        'as' => 'generated::PkAlRqpte7wZ5bc0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QS9XitG0F0uwdMbW' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard-stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\DashboardController@getDashboardStats',
        'controller' => 'App\\Http\\Controllers\\DashboardController@getDashboardStats',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::QS9XitG0F0uwdMbW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uC0HlNdbPy1W0Oc4' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard-monthly',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\DashboardController@getMonthlyStats',
        'controller' => 'App\\Http\\Controllers\\DashboardController@getMonthlyStats',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::uC0HlNdbPy1W0Oc4',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cCxsPsshJqXRmdVx' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard-activities',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\DashboardController@getRecentActivities',
        'controller' => 'App\\Http\\Controllers\\DashboardController@getRecentActivities',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::cCxsPsshJqXRmdVx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DK8koNrTaJBDZWQn' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard-coordination',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\DashboardController@getBarangayCoordination',
        'controller' => 'App\\Http\\Controllers\\DashboardController@getBarangayCoordination',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::DK8koNrTaJBDZWQn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::H1ZEcVDSdl35p2PI' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/application-status/{referenceNumber}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1376:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1156:"function ($referenceNumber) {
    try {
        $application = \\App\\Models\\Application::where(\'referenceNumber\', $referenceNumber)->first();
        
        if (!$application) {
            return \\response()->json([
                \'success\' => false,
                \'message\' => \'Application not found\'
            ], 404);
        }
        
        return \\response()->json([
            \'success\' => true,
            \'application\' => [
                \'referenceNumber\' => $application->referenceNumber,
                \'firstName\' => $application->firstName,
                \'middleName\' => $application->middleName,
                \'lastName\' => $application->lastName,
                \'suffix\' => $application->suffix,
                \'status\' => $application->status,
                \'submissionDate\' => $application->submissionDate,
                \'remarks\' => $application->remarks
            ]
        ]);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'success\' => false,
            \'message\' => \'Error checking application status: \' . $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006e10000000000000000";}";s:4:"hash";s:44:"CuEMBnxy/uZ6SoH/DRMBmKPMEbi4LQepo18QX4lKwTc=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::H1ZEcVDSdl35p2PI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9LarYdh7ZvVVzpLU' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/check-user-status/{email}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2042:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1822:"function ($email) {
    try {
        $user = \\App\\Models\\User::where(\'email\', $email)->first();
        $application = \\App\\Models\\Application::where(\'email\', $email)->first();
        
        if (!$user && !$application) {
            return \\response()->json([
                \'exists\' => false,
                \'message\' => \'No account or application found with this email address\'
            ]);
        }
        
        $response = [
            \'email\' => $email,
            \'user_account\' => null,
            \'application\' => null
        ];
        
        if ($user) {
            $response[\'user_account\'] = [
                \'userID\' => $user->userID,
                \'email\' => $user->email,
                \'username\' => $user->username,
                \'role\' => $user->role,
                \'status\' => $user->status,
                \'created_at\' => $user->created_at,
                \'updated_at\' => $user->updated_at
            ];
        }
        
        if ($application) {
            $response[\'application\'] = [
                \'applicationID\' => $application->applicationID,
                \'firstName\' => $application->firstName,
                \'lastName\' => $application->lastName,
                \'email\' => $application->email,
                \'status\' => $application->status,
                \'submissionDate\' => $application->submissionDate,
                \'created_at\' => $application->created_at,
                \'updated_at\' => $application->updated_at
            ];
        }
        
        return \\response()->json($response);
        
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to check user status\',
            \'message\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006e30000000000000000";}";s:4:"hash";s:44:"p+d4Now+EoA4Fus/dLtAifDQc9ddZqkN0K6O3hPPvKw=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::9LarYdh7ZvVVzpLU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QC3EHIz8StYr7qyE' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-members-fallback',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1924:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1704:"function () {
    try {
        // Get approved applications as PWD members
        $approvedApplications = \\App\\Models\\Application::where(\'status\', \'Approved\')->get();
        
        $members = $approvedApplications->map(function ($app) {
            return [
                \'id\' => $app->applicationID,
                \'userID\' => $app->applicationID,
                \'firstName\' => $app->firstName,
                \'lastName\' => $app->lastName,
                \'middleName\' => $app->middleName,
                \'suffix\' => $app->suffix,
                \'birthDate\' => $app->birthDate,
                \'gender\' => $app->gender,
                \'disabilityType\' => $app->disabilityType,
                \'address\' => $app->address,
                \'contactNumber\' => $app->contactNumber,
                \'email\' => $app->email,
                \'barangay\' => $app->barangay,
                \'emergencyContact\' => $app->emergencyContact,
                \'emergencyPhone\' => $app->emergencyPhone,
                \'emergencyRelationship\' => $app->emergencyRelationship,
                \'status\' => \'Active\',
                \'created_at\' => $app->created_at,
                \'updated_at\' => $app->updated_at
            ];
        });
        
        return \\response()->json([
            \'success\' => true,
            \'members\' => $members,
            \'count\' => $members->count(),
            \'source\' => \'approved_applications\'
        ]);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'success\' => false,
            \'message\' => \'Failed to fetch PWD members\',
            \'error\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000069e0000000000000000";}";s:4:"hash";s:44:"HI1fux5r6iCFGaFTAV7z8lzO9aUtaHXRv95ALBRMDgY=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::QC3EHIz8StYr7qyE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ri5318xXJJHGcdri' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-database-email',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2018:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1798:"function () {
    try {
        // Test database connection
        $dbTest = \'Database: \';
        try {
            $appCount = \\App\\Models\\Application::count();
            $dbTest .= "SUCCESS - Applications count: {$appCount}";
        } catch (\\Exception $e) {
            $dbTest .= "ERROR - " . $e->getMessage();
        }

        // Test email service
        $emailTest = \'Email: \';
        try {
            $emailService = new \\App\\Services\\EmailService();
            $gmailService = $emailService->getGmailService();
            $emailTest .= "Gmail API configured: " . ($gmailService->isConfigured() ? \'YES\' : \'NO\');
        } catch (\\Exception $e) {
            $emailTest .= "ERROR - " . $e->getMessage();
        }

        return \\response()->json([
            \'message\' => \'Database and Email Test\',
            \'database_test\' => $dbTest,
            \'email_test\' => $emailTest,
            \'env_check\' => [
                \'db_connection\' => \\config(\'database.default\'),
                \'db_host\' => \\config(\'database.connections.mysql.host\'),
                \'db_database\' => \\config(\'database.connections.mysql.database\'),
                \'mail_mailer\' => \\config(\'mail.default\'),
                \'mail_host\' => \\config(\'mail.mailers.smtp.host\'),
                \'mail_username\' => \\config(\'mail.mailers.smtp.username\'),
                \'google_client_id\' => !empty(\\config(\'services.google.client_id\')) ? \'SET\' : \'NOT SET\',
                \'google_refresh_token\' => !empty(\\config(\'services.google.refresh_token\')) ? \'SET\' : \'NOT SET\'
            ]
        ]);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Test failed\',
            \'message\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006e70000000000000000";}";s:4:"hash";s:44:"vJJGN2AMk5scp/apMjui+5AvhHE4QvEFAcSSGycTV9g=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Ri5318xXJJHGcdri',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SjSfUmqn9YKDq59J' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-approval-email/{applicationId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2237:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2017:"function ($applicationId) {
    try {
        $application = \\App\\Models\\Application::find($applicationId);
        
        if (!$application) {
            return \\response()->json([
                \'error\' => \'Application not found\',
                \'application_id\' => $applicationId
            ], 404);
        }

        // Generate test credentials
        $testPassword = \'testpass123\';
        $testPwdId = \'PWD-TEST-\' . $applicationId;

        // Send approval email using SMTP only
        \\Illuminate\\Support\\Facades\\Mail::send(\'emails.application-approved\', [
            \'firstName\' => $application->firstName,
            \'lastName\' => $application->lastName,
            \'email\' => $application->email,
            \'username\' => $application->email,
            \'password\' => $testPassword,
            \'pwdId\' => $testPwdId,
            \'loginUrl\' => \'http://localhost:3000/login\'
        ], function ($message) use ($application) {
            $message->to($application->email)
                   ->subject(\'PWD Application Approved - Account Created\')
                   ->from(\'sarinonhoelivan29@gmail.com\', \'Cabuyao PDAO RMS\');
        });

        return \\response()->json([
            \'message\' => \'Approval email sent successfully\',
            \'application\' => [
                \'id\' => $application->applicationID,
                \'name\' => $application->firstName . \' \' . $application->lastName,
                \'email\' => $application->email
            ],
            \'credentials\' => [
                \'email\' => $application->email,
                \'password\' => $testPassword,
                \'pwdId\' => $testPwdId
            ],
            \'from\' => \'sarinonhoelivan29@gmail.com\'
        ]);

    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to send approval email\',
            \'message\' => $e->getMessage(),
            \'application_id\' => $applicationId
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006e90000000000000000";}";s:4:"hash";s:44:"nSYQNxtCGvSbVTPB29iZNN40Wj84IIU1aoPIHNRDIHY=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::SjSfUmqn9YKDq59J',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PqP0MdDu4kHxG9wq' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-gmail-integration',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1926:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1706:"function () {
    try {
        $emailService = new \\App\\Services\\EmailService();
        $gmailService = $emailService->getGmailService();
        
        $status = [
            \'gmail_configured\' => $gmailService->isConfigured(),
            \'client_id_set\' => !empty(\\config(\'services.google.client_id\')),
            \'client_secret_set\' => !empty(\\config(\'services.google.client_secret\')),
            \'refresh_token_set\' => !empty(\\config(\'services.google.refresh_token\')),
            \'redirect_uri\' => \\config(\'services.google.redirect_uri\'),
            \'frontend_url\' => \\config(\'app.frontend_url\', \'http://localhost:3000\'),
            \'admin_email\' => \'sarinonhoelivan29@gmail.com\',
            \'mail_from_address\' => \\config(\'mail.from.address\'),
            \'mail_from_name\' => \\config(\'mail.from.name\')
        ];
        
        return \\response()->json([
            \'message\' => \'Gmail integration test for admin email\',
            \'status\' => $status,
            \'admin_email\' => \'sarinonhoelivan29@gmail.com\',
            \'instructions\' => [
                \'1. Set up Google Cloud Console project\',
                \'2. Enable Gmail API\',
                \'3. Create OAuth 2.0 credentials\',
                \'4. Add environment variables to .env\',
                \'5. Complete OAuth flow via /api/gmail/auth-url\',
                \'6. Test email sending via /api/gmail/test\'
            ]
        ]);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Gmail integration test failed\',
            \'message\' => $e->getMessage(),
            \'admin_email\' => \'sarinonhoelivan29@gmail.com\'
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006eb0000000000000000";}";s:4:"hash";s:44:"jo3LYS+Zx2+JCsWQvxkMrID0ih0/QyPfti6rmA5nojg=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::PqP0MdDu4kHxG9wq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::xVAMqSAekPsCmAsT' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-send-approval-email/{email}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1268:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1048:"function ($email) {
    try {
        $emailService = new \\App\\Services\\EmailService();
        
        $testData = [
            \'firstName\' => \'Test\',
            \'lastName\' => \'User\',
            \'email\' => $email, // This will be the recipient
            \'username\' => $email,
            \'password\' => \'testpass123\',
            \'pwdId\' => \'PWD-TEST-001\',
            \'loginUrl\' => \'http://localhost:3000/login\'
        ];
        
        $result = $emailService->sendApplicationApprovalEmail($testData);
        
        return \\response()->json([
            \'message\' => \'Test approval email sent\',
            \'success\' => $result,
            \'recipient\' => $email,
            \'from\' => \'sarinonhoelivan29@gmail.com\',
            \'test_data\' => $testData
        ]);
        
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to send test approval email\',
            \'message\' => $e->getMessage(),
            \'recipient\' => $email
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006ed0000000000000000";}";s:4:"hash";s:44:"9Jv2xDHpOpxm6kOZ7aq+0sYd4xOtHZaNhf0CKHXRqs8=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::xVAMqSAekPsCmAsT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IkhNJ4e2kP2k9FFs' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/test-application-submission',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:8014:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:7794:"function (\\Illuminate\\Http\\Request $request) {
    try {
        // Log the incoming request
        \\Illuminate\\Support\\Facades\\Log::info(\'Test application submission\', [
            \'request_data\' => $request->all(),
            \'has_files\' => $request->hasFile(\'idPicture\') || $request->hasFile(\'medicalCertificate\') || $request->hasFile(\'barangayClearance\')
        ]);

        // Use the validation service for comprehensive duplicate checking
        $validationService = new \\App\\Services\\ApplicationValidationService();
        
        // First, check for duplicates before validation
        $duplicates = $validationService->checkForDuplicates($request->all());
        if (!empty($duplicates)) {
            \\Illuminate\\Support\\Facades\\Log::warning(\'Duplicate test application detected\', [
                \'duplicates\' => $duplicates,
                \'request_data\' => $request->all()
            ]);
            
            return \\response()->json([
                \'error\' => \'Duplicate application detected\',
                \'message\' => \'An application with similar information already exists.\',
                \'duplicates\' => $duplicates,
                \'suggestions\' => [
                    \'Check your existing application status\',
                    \'Contact support if you believe this is an error\',
                    \'Use a different email address if this is for a different person\'
                ]
            ], 409); // 409 Conflict
        }

        // Get validation rules from service
        $rules = $validationService->getValidationRules();
        $messages = $validationService->getValidationMessages();
        
        $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            \\Illuminate\\Support\\Facades\\Log::error(\'Validation failed\', [
                \'errors\' => $validator->errors()
            ]);
            return \\response()->json([
                \'error\' => \'Validation failed\',
                \'messages\' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data[\'status\'] = \'Pending Barangay Approval\';
        $data[\'submissionDate\'] = \\now();

        // Handle file uploads
        $uploadPath = \'uploads/applications/\' . \\date(\'Y/m/d\');
        \\Illuminate\\Support\\Facades\\Storage::makeDirectory($uploadPath);

        if ($request->hasFile(\'idPicture\')) {
            $idPictureFile = $request->file(\'idPicture\');
            $idPictureName = \'id_picture_\' . \\time() . \'.\' . $idPictureFile->getClientOriginalExtension();
            $idPicturePath = $idPictureFile->storeAs($uploadPath, $idPictureName, \'public\');
            $data[\'idPicture\'] = $idPicturePath;
        }

        if ($request->hasFile(\'medicalCertificate\')) {
            $medicalFile = $request->file(\'medicalCertificate\');
            $medicalName = \'medical_cert_\' . \\time() . \'.\' . $medicalFile->getClientOriginalExtension();
            $medicalPath = $medicalFile->storeAs($uploadPath, $medicalName, \'public\');
            $data[\'medicalCertificate\'] = $medicalPath;
        }

        if ($request->hasFile(\'barangayClearance\')) {
            $clearanceFile = $request->file(\'barangayClearance\');
            $clearanceName = \'barangay_clearance_\' . \\time() . \'.\' . $clearanceFile->getClientOriginalExtension();
            $clearancePath = $clearanceFile->storeAs($uploadPath, $clearanceName, \'public\');
            $data[\'barangayClearance\'] = $clearancePath;
        }

        // Handle new document fields
        if ($request->hasFile(\'clinicalAbstract\')) {
            $clinicalFile = $request->file(\'clinicalAbstract\');
            $clinicalName = \'clinical_abstract_\' . \\time() . \'.\' . $clinicalFile->getClientOriginalExtension();
            $clinicalPath = $clinicalFile->storeAs($uploadPath, $clinicalName, \'public\');
            $data[\'clinicalAbstract\'] = $clinicalPath;
        }

        if ($request->hasFile(\'voterCertificate\')) {
            $voterFile = $request->file(\'voterCertificate\');
            $voterName = \'voter_certificate_\' . \\time() . \'.\' . $voterFile->getClientOriginalExtension();
            $voterPath = $voterFile->storeAs($uploadPath, $voterName, \'public\');
            $data[\'voterCertificate\'] = $voterPath;
        }

        // Handle multiple ID pictures
        $idPictures = [];
        for ($i = 0; $i < 2; $i++) {
            if ($request->hasFile("idPicture_$i")) {
                $idPictureFile = $request->file("idPicture_$i");
                $idPictureName = "id_picture_{$i}_" . \\time() . \'.\' . $idPictureFile->getClientOriginalExtension();
                $idPicturePath = $idPictureFile->storeAs($uploadPath, $idPictureName, \'public\');
                $idPictures[] = $idPicturePath;
            }
        }
        if (!empty($idPictures)) {
            $data[\'idPictures\'] = \\json_encode($idPictures);
        }

        if ($request->hasFile(\'birthCertificate\')) {
            $birthFile = $request->file(\'birthCertificate\');
            $birthName = \'birth_certificate_\' . \\time() . \'.\' . $birthFile->getClientOriginalExtension();
            $birthPath = $birthFile->storeAs($uploadPath, $birthName, \'public\');
            $data[\'birthCertificate\'] = $birthPath;
        }

        if ($request->hasFile(\'wholeBodyPicture\')) {
            $wholeBodyFile = $request->file(\'wholeBodyPicture\');
            $wholeBodyName = \'whole_body_picture_\' . \\time() . \'.\' . $wholeBodyFile->getClientOriginalExtension();
            $wholeBodyPath = $wholeBodyFile->storeAs($uploadPath, $wholeBodyName, \'public\');
            $data[\'wholeBodyPicture\'] = $wholeBodyPath;
        }

        if ($request->hasFile(\'affidavit\')) {
            $affidavitFile = $request->file(\'affidavit\');
            $affidavitName = \'affidavit_\' . \\time() . \'.\' . $affidavitFile->getClientOriginalExtension();
            $affidavitPath = $affidavitFile->storeAs($uploadPath, $affidavitName, \'public\');
            $data[\'affidavit\'] = $affidavitPath;
        }

        if ($request->hasFile(\'barangayCertificate\')) {
            $barangayCertFile = $request->file(\'barangayCertificate\');
            $barangayCertName = \'barangay_certificate_\' . \\time() . \'.\' . $barangayCertFile->getClientOriginalExtension();
            $barangayCertPath = $barangayCertFile->storeAs($uploadPath, $barangayCertName, \'public\');
            $data[\'barangayCertificate\'] = $barangayCertPath;
        }

        \\Illuminate\\Support\\Facades\\Log::info(\'Creating application with data\', [
            \'data\' => $data
        ]);

        $application = \\App\\Models\\Application::create($data);

        \\Illuminate\\Support\\Facades\\Log::info(\'Application created successfully\', [
            \'application_id\' => $application->applicationID,
            \'application\' => $application->toArray()
        ]);

        return \\response()->json([
            \'message\' => \'Test application submitted successfully\',
            \'application\' => $application,
            \'debug_info\' => [
                \'data_sent\' => $data,
                \'application_id\' => $application->applicationID
            ]
        ], 201);

    } catch (\\Exception $e) {
        \\Illuminate\\Support\\Facades\\Log::error(\'Test application submission failed\', [
            \'error\' => $e->getMessage(),
            \'trace\' => $e->getTraceAsString()
        ]);
        
        return \\response()->json([
            \'error\' => \'Failed to submit test application\',
            \'message\' => $e->getMessage(),
            \'trace\' => $e->getTraceAsString()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006ef0000000000000000";}";s:4:"hash";s:44:"M9QMlhAI3OTjyS05OwnrVguZvH0g+jG/SQiS8OBav18=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::IkhNJ4e2kP2k9FFs',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::T4kUHvENuSLv3Bm9' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/mobile-test',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:607:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:388:"function () {
    return \\response()->json([
        \'status\' => \'success\',
        \'message\' => \'Mobile connection successful\',
        \'timestamp\' => \\now()->toISOString(),
        \'server_info\' => [
            \'ip\' => \\request()->server(\'SERVER_ADDR\'),
            \'port\' => \\request()->server(\'SERVER_PORT\'),
            \'host\' => \\request()->getHost()
        ]
    ]);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006f10000000000000000";}";s:4:"hash";s:44:"PceBmVkY+M+Pls9xJgXMuahLe6c7ZAQ1ux4msnWSAJM=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::T4kUHvENuSLv3Bm9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vccOULw7bNpQBAkb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-pwd',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:495:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:276:"function () {
    try {
        $members = \\App\\Models\\PWDMember::all();
        return \\response()->json([\'count\' => $members->count(), \'members\' => $members]);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006f30000000000000000";}";s:4:"hash";s:44:"3ybYZPOApTNQRAbMiwPqgDeZzme9AOGmzBbbiISXEvU=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::vccOULw7bNpQBAkb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EOLz7IWxZR8SICir' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/simple-pwd',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:499:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:280:"function () {
    try {
        $members = \\DB::table(\'pwd_members\')->get();
        return \\response()->json([\'count\' => $members->count(), \'members\' => $members]);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006f50000000000000000";}";s:4:"hash";s:44:"pz7viKBONuREaTwIShkPcLeg3ta+1/yr/BCaAXZ7OSg=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::EOLz7IWxZR8SICir',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bQgUzW4QCl3vua24' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/debug-pwd-applications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1247:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1027:"function () {
    try {
        $members = \\App\\Models\\PWDMember::all();
        $applications = \\App\\Models\\Application::where(\'status\', \'Approved\')->get();
        
        $debug = [
            \'pwd_members\' => $members->map(function($member) {
                return [
                    \'id\' => $member->id,
                    \'userID\' => $member->userID,
                    \'name\' => $member->firstName . \' \' . $member->lastName
                ];
            }),
            \'approved_applications\' => $applications->map(function($app) {
                return [
                    \'applicationID\' => $app->applicationID,
                    \'pwdID\' => $app->pwdID,
                    \'name\' => $app->firstName . \' \' . $app->lastName,
                    \'barangay\' => $app->barangay
                ];
            })
        ];
        
        return \\response()->json($debug);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006f70000000000000000";}";s:4:"hash";s:44:"FiZ/SXO+b13ZUh2QzLD4/shzcNb2CYMl4E0WBdQQGQk=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::bQgUzW4QCl3vua24',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::URjHsrlkasOZRJg8' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/mock-pwd',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2842:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2622:"function () {
    try {
        $members = \\App\\Models\\PWDMember::all();
        
        // Transform the data to match the expected format
        $transformedMembers = $members->map(function ($member) {
            // Get emergency contact and barangay from the approved application
            // Match pwdID in applications to the PWD member\'s userID field
            $approvedApplication = \\App\\Models\\Application::where(\'pwdID\', $member->userID)
                ->where(\'status\', \'Approved\')
                ->latest()
                ->first();
            
            $emergencyContact = $approvedApplication ? $approvedApplication->emergencyContact : $member->emergencyContact;
            $barangay = $approvedApplication ? $approvedApplication->barangay : $member->barangay;
            $idPictures = $approvedApplication ? $approvedApplication->idPictures : null;
            
            // Get email from the User table
            $user = \\App\\Models\\User::where(\'userID\', $member->userID)->first();
            $email = $user ? $user->email : $member->email;
            
            // Generate PWD ID if not exists
            $pwdId = $member->pwd_id ?: \'PWD-\' . \\str_pad($member->userID, 6, \'0\', STR_PAD_LEFT);
            
            return [
                \'id\' => $member->id,
                \'userID\' => $member->userID,
                \'pwd_id\' => $pwdId,
                \'firstName\' => $member->firstName,
                \'lastName\' => $member->lastName,
                \'middleName\' => $member->middleName,
                \'suffix\' => $member->suffix,
                \'birthDate\' => $member->birthDate,
                \'gender\' => $member->gender,
                \'disabilityType\' => $member->disabilityType,
                \'address\' => $member->address,
                \'contactNumber\' => $member->contactNumber,
                \'emergencyContact\' => $emergencyContact,
                \'barangay\' => $barangay,
                \'idPictures\' => $idPictures,
                \'email\' => $email,
                \'qr_code_data\' => $member->qr_code_data,
                \'qr_code_generated_at\' => $member->qr_code_generated_at
            ];
        });
        
        return \\response()->json([
            \'count\' => $members->count(),
            \'members\' => $transformedMembers
        ]);
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to fetch PWD members\',
            \'message\' => $e->getMessage(),
            \'count\' => 0,
            \'members\' => []
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006f90000000000000000";}";s:4:"hash";s:44:"0pIw0YxZUYwuTa/N29HEisbXXV9y/ObinUa4GDiEEOw=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::URjHsrlkasOZRJg8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'users.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/users',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'users.index',
        'uses' => 'App\\Http\\Controllers\\API\\UserController@index',
        'controller' => 'App\\Http\\Controllers\\API\\UserController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'users.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/users',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'users.store',
        'uses' => 'App\\Http\\Controllers\\API\\UserController@store',
        'controller' => 'App\\Http\\Controllers\\API\\UserController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'users.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/users/{user}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'users.show',
        'uses' => 'App\\Http\\Controllers\\API\\UserController@show',
        'controller' => 'App\\Http\\Controllers\\API\\UserController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'users.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/users/{user}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'users.update',
        'uses' => 'App\\Http\\Controllers\\API\\UserController@update',
        'controller' => 'App\\Http\\Controllers\\API\\UserController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'users.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/users/{user}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'users.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\UserController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\UserController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'complaints.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/complaints',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'complaints.index',
        'uses' => 'App\\Http\\Controllers\\API\\ComplaintController@index',
        'controller' => 'App\\Http\\Controllers\\API\\ComplaintController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'complaints.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/complaints',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'complaints.store',
        'uses' => 'App\\Http\\Controllers\\API\\ComplaintController@store',
        'controller' => 'App\\Http\\Controllers\\API\\ComplaintController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'complaints.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/complaints/{complaint}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'complaints.show',
        'uses' => 'App\\Http\\Controllers\\API\\ComplaintController@show',
        'controller' => 'App\\Http\\Controllers\\API\\ComplaintController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'complaints.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/complaints/{complaint}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'complaints.update',
        'uses' => 'App\\Http\\Controllers\\API\\ComplaintController@update',
        'controller' => 'App\\Http\\Controllers\\API\\ComplaintController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'complaints.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/complaints/{complaint}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'complaints.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\ComplaintController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\ComplaintController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'reports.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'reports.index',
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@index',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'reports.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reports',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'reports.store',
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@store',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'reports.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/{report}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'reports.show',
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@show',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'reports.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/reports/{report}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'reports.update',
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@update',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'reports.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/reports/{report}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'reports.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::zX0IStLZqFZjr3MJ' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/register',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuthController@register',
        'controller' => 'App\\Http\\Controllers\\API\\AuthController@register',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::zX0IStLZqFZjr3MJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::71vqUz08CbNOPQB2' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/logout',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuthController@logout',
        'controller' => 'App\\Http\\Controllers\\API\\AuthController@logout',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::71vqUz08CbNOPQB2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefits.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefits',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefits.index',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitController@index',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OMLHz4MsIXzkOCaS' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefits/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\BenefitController@show',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::OMLHz4MsIXzkOCaS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ki0a1NWsLUsxT05Y' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-benefits',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:303:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:85:"function () {
    return \\response()->json([\'message\' => \'Benefits route test\']);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006c80000000000000000";}";s:4:"hash";s:44:"3Lw8NQkig5BkpAvF9Fn1XNAo5S4NVUzz9Ux5td3cRfY=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Ki0a1NWsLUsxT05Y',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::CKpGDoqqUoTLrSik' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefits-simple',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:450:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:231:"function () {
    try {
        $benefits = \\App\\Models\\Benefit::all();
        return \\response()->json($benefits);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000070f0000000000000000";}";s:4:"hash";s:44:"5F//RjVHtaNIuBp4hZYG5p+VDuvUwhSvg3uNEC0uyCw=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::CKpGDoqqUoTLrSik',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Cwq2RTj5D8Pv5Rpr' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/benefits-simple',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:504:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:285:"function (\\Illuminate\\Http\\Request $request) {
    try {
        $benefit = \\App\\Models\\Benefit::create($request->all());
        return \\response()->json($benefit, 201);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007110000000000000000";}";s:4:"hash";s:44:"FtD823CIz1Sd9iGA7/Q1VmnJ46cmyBU5/IIXp8JI/PI=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Cwq2RTj5D8Pv5Rpr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fAwQQa75BSilB0zC' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/benefits-simple/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:649:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:430:"function (\\Illuminate\\Http\\Request $request, $id) {
    try {
        $benefit = \\App\\Models\\Benefit::find($id);
        if (!$benefit) {
            return \\response()->json([\'error\' => \'Benefit not found\'], 404);
        }
        $benefit->update($request->all());
        return \\response()->json($benefit);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007130000000000000000";}";s:4:"hash";s:44:"dpyMwxDlThVnWT7NFttlZSYNvPgu1GlPuVTOQllWdU4=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::fAwQQa75BSilB0zC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cE943szaE8ofD5G8' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/benefits-simple/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:636:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:417:"function ($id) {
    try {
        $benefit = \\App\\Models\\Benefit::find($id);
        if (!$benefit) {
            return \\response()->json([\'error\' => \'Benefit not found\'], 404);
        }
        $benefit->delete();
        return \\response()->json([\'message\' => \'Benefit deleted successfully\']);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007150000000000000000";}";s:4:"hash";s:44:"WtfOZRyfrBpfuXrapgR5UYiGfFopJCsBkNtRADD1uxo=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::cE943szaE8ofD5G8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5PPHfLrBrkSrwgM2' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefit-claims/{benefitId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:493:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:274:"function ($benefitId) {
    try {
        $claims = \\App\\Models\\BenefitClaim::where(\'benefitID\', $benefitId)->get();
        return \\response()->json($claims);
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007170000000000000000";}";s:4:"hash";s:44:"MvV48xEkdSmKKju6uD/Us2ehkxnNMUZ4BXerfcFk+ds=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::5PPHfLrBrkSrwgM2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefit-claims.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/benefit-claims',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefit-claims.store',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitClaimController@store',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitClaimController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eRyChsRImoIt3xdK' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/announcements/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@show',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::eRyChsRImoIt3xdK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefit-claims.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefit-claims',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefit-claims.index',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitClaimController@index',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitClaimController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::nKoEgqVkWezUN9QS' => 
    array (
      'methods' => 
      array (
        0 => 'PATCH',
      ),
      'uri' => 'api/benefit-claims/{id}/status',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\BenefitClaimController@updateStatus',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitClaimController@updateStatus',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::nKoEgqVkWezUN9QS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fxPeGoHpMi8sG3m6' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/documents/public',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getPublicDocuments',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getPublicDocuments',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::fxPeGoHpMi8sG3m6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mwMkIeC7nxjO0DsA' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/applications/check-duplicates',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:943:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:724:"function (\\Illuminate\\Http\\Request $request) {
    try {
        $validationService = new \\App\\Services\\ApplicationValidationService();
        $duplicates = $validationService->checkForDuplicates($request->all());
        
        return \\response()->json([
            \'has_duplicates\' => !empty($duplicates),
            \'duplicates\' => $duplicates,
            \'message\' => empty($duplicates) ? \'No duplicates found. You can proceed with your application.\' : \'Duplicate applications detected.\'
        ]);
        
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to check for duplicates\',
            \'message\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000006c20000000000000000";}";s:4:"hash";s:44:"SnwOZMZxuy+tiIQ9pyDLi+3U9KGuSG/k+CCRaJKmSr8=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::mwMkIeC7nxjO0DsA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rY42HrfFT5wfuNLv' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/send-verification-code',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1924:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1704:"function (\\Illuminate\\Http\\Request $request) {
    try {
        $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
            \'email\' => \'required|email\',
            \'purpose\' => \'sometimes|string\'
        ]);

        if ($validator->fails()) {
            return \\response()->json([
                \'error\' => \'Validation failed\',
                \'messages\' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $purpose = $request->purpose ?? \'application_submission\';

        // Create verification record
        $verification = \\App\\Models\\EmailVerification::createVerification($email, $purpose);

        // Send email
        \\Illuminate\\Support\\Facades\\Mail::send(\'emails.verification-code\', [
            \'verificationCode\' => $verification->verification_code
        ], function ($message) use ($email) {
            $message->to($email)
                   ->subject(\'PWD Application - Email Verification Code\')
                   ->from(\'sarinonhoelivan29@gmail.com\', \'Cabuyao PDAO RMS\');
        });

        return \\response()->json([
            \'success\' => true,
            \'message\' => \'Verification code sent successfully\',
            \'expires_in_minutes\' => 10
        ]);

    } catch (\\Exception $e) {
        \\Illuminate\\Support\\Facades\\Log::error(\'Failed to send verification code\', [
            \'error\' => $e->getMessage(),
            \'email\' => $request->email ?? \'unknown\'
        ]);

        return \\response()->json([
            \'error\' => \'Failed to send verification code\',
            \'message\' => \'Please try again later\'
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000071d0000000000000000";}";s:4:"hash";s:44:"gyBS25ZVk4Gr7zuu6JjUM98XbocRdOLG44i3wBpUeJo=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::rY42HrfFT5wfuNLv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Z1EvDBA9zDIMmkmP' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/verify-code',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2024:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1804:"function (\\Illuminate\\Http\\Request $request) {
    try {
        $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), [
            \'email\' => \'required|email\',
            \'code\' => \'required|string|size:6\',
            \'purpose\' => \'sometimes|string\'
        ]);

        if ($validator->fails()) {
            return \\response()->json([
                \'error\' => \'Validation failed\',
                \'messages\' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $code = $request->code;
        $purpose = $request->purpose ?? \'application_submission\';

        // Check if code exists and is valid (but don\'t mark as used yet)
        $verification = \\App\\Models\\EmailVerification::where(\'email\', $email)
            ->where(\'verification_code\', $code)
            ->where(\'purpose\', $purpose)
            ->where(\'is_used\', false)
            ->where(\'expires_at\', \'>\', \\now())
            ->first();

        if ($verification) {
            return \\response()->json([
                \'success\' => true,
                \'message\' => \'Email verified successfully\'
            ]);
        } else {
            return \\response()->json([
                \'error\' => \'Invalid verification code\',
                \'message\' => \'The verification code is invalid, expired, or already used\'
            ], 400);
        }

    } catch (\\Exception $e) {
        \\Illuminate\\Support\\Facades\\Log::error(\'Failed to verify code\', [
            \'error\' => $e->getMessage(),
            \'email\' => $request->email ?? \'unknown\'
        ]);

        return \\response()->json([
            \'error\' => \'Failed to verify code\',
            \'message\' => \'Please try again later\'
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000071f0000000000000000";}";s:4:"hash";s:44:"1bIEuaIHUrTxGPVs5EqarRe9rcgbEmqpxPg/XYko3c0=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Z1EvDBA9zDIMmkmP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1TVxnNhmqPoOpAtq' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/applications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:8670:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:8450:"function (\\Illuminate\\Http\\Request $request) {
    try {
        // Log the incoming request for debugging
        \\Illuminate\\Support\\Facades\\Log::info(\'Application submission attempt\', [
            \'request_data\' => $request->all(),
            \'has_files\' => $request->hasFile(\'idPicture\') || $request->hasFile(\'medicalCertificate\') || $request->hasFile(\'barangayClearance\')
        ]);

        // Check email verification first
        $email = $request->email;
        $verificationCode = $request->verification_code;
        
        if (!$email || !$verificationCode) {
            return \\response()->json([
                \'error\' => \'Email verification required\',
                \'message\' => \'Please verify your email address before submitting the application\'
            ], 400);
        }

        // Verify the email code
        $isVerified = \\App\\Models\\EmailVerification::verifyCode($email, $verificationCode, \'application_submission\');
        
        if (!$isVerified) {
            return \\response()->json([
                \'error\' => \'Email verification failed\',
                \'message\' => \'Invalid or expired verification code. Please request a new code.\'
            ], 400);
        }

        // Use the validation service for comprehensive duplicate checking
        $validationService = new \\App\\Services\\ApplicationValidationService();
        
        // First, check for duplicates before validation
        $duplicates = $validationService->checkForDuplicates($request->all());
        if (!empty($duplicates)) {
            \\Illuminate\\Support\\Facades\\Log::warning(\'Duplicate application detected\', [
                \'duplicates\' => $duplicates,
                \'request_data\' => $request->all()
            ]);
            
            return \\response()->json([
                \'error\' => \'Duplicate application detected\',
                \'message\' => \'An application with similar information already exists.\',
                \'duplicates\' => $duplicates,
                \'suggestions\' => [
                    \'Check your existing application status\',
                    \'Contact support if you believe this is an error\',
                    \'Use a different email address if this is for a different person\'
                ]
            ], 409); // 409 Conflict
        }

        // Get validation rules from service
        $rules = $validationService->getValidationRules();
        $messages = $validationService->getValidationMessages();
        
        $validator = \\Illuminate\\Support\\Facades\\Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            \\Illuminate\\Support\\Facades\\Log::error(\'Application validation failed\', [
                \'errors\' => $validator->errors()
            ]);
            return \\response()->json([
                \'error\' => \'Validation failed\',
                \'messages\' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data[\'status\'] = \'Pending Barangay Approval\';
        $data[\'submissionDate\'] = \\now();

        // Handle file uploads
        $uploadPath = \'uploads/applications/\' . \\date(\'Y/m/d\');
        \\Illuminate\\Support\\Facades\\Storage::makeDirectory($uploadPath);

        if ($request->hasFile(\'idPicture\')) {
            $idPictureFile = $request->file(\'idPicture\');
            $idPictureName = \'id_picture_\' . \\time() . \'.\' . $idPictureFile->getClientOriginalExtension();
            $idPicturePath = $idPictureFile->storeAs($uploadPath, $idPictureName, \'public\');
            $data[\'idPicture\'] = $idPicturePath;
        }

        if ($request->hasFile(\'medicalCertificate\')) {
            $medicalFile = $request->file(\'medicalCertificate\');
            $medicalName = \'medical_cert_\' . \\time() . \'.\' . $medicalFile->getClientOriginalExtension();
            $medicalPath = $medicalFile->storeAs($uploadPath, $medicalName, \'public\');
            $data[\'medicalCertificate\'] = $medicalPath;
        }

        if ($request->hasFile(\'barangayClearance\')) {
            $clearanceFile = $request->file(\'barangayClearance\');
            $clearanceName = \'barangay_clearance_\' . \\time() . \'.\' . $clearanceFile->getClientOriginalExtension();
            $clearancePath = $clearanceFile->storeAs($uploadPath, $clearanceName, \'public\');
            $data[\'barangayClearance\'] = $clearancePath;
        }

        // Handle new document fields
        if ($request->hasFile(\'clinicalAbstract\')) {
            $clinicalFile = $request->file(\'clinicalAbstract\');
            $clinicalName = \'clinical_abstract_\' . \\time() . \'.\' . $clinicalFile->getClientOriginalExtension();
            $clinicalPath = $clinicalFile->storeAs($uploadPath, $clinicalName, \'public\');
            $data[\'clinicalAbstract\'] = $clinicalPath;
        }

        if ($request->hasFile(\'voterCertificate\')) {
            $voterFile = $request->file(\'voterCertificate\');
            $voterName = \'voter_certificate_\' . \\time() . \'.\' . $voterFile->getClientOriginalExtension();
            $voterPath = $voterFile->storeAs($uploadPath, $voterName, \'public\');
            $data[\'voterCertificate\'] = $voterPath;
        }

        // Handle multiple ID pictures
        $idPictures = [];
        for ($i = 0; $i < 2; $i++) {
            if ($request->hasFile("idPicture_$i")) {
                $idPictureFile = $request->file("idPicture_$i");
                $idPictureName = "id_picture_{$i}_" . \\time() . \'.\' . $idPictureFile->getClientOriginalExtension();
                $idPicturePath = $idPictureFile->storeAs($uploadPath, $idPictureName, \'public\');
                $idPictures[] = $idPicturePath;
            }
        }
        if (!empty($idPictures)) {
            $data[\'idPictures\'] = \\json_encode($idPictures);
        }

        if ($request->hasFile(\'birthCertificate\')) {
            $birthFile = $request->file(\'birthCertificate\');
            $birthName = \'birth_certificate_\' . \\time() . \'.\' . $birthFile->getClientOriginalExtension();
            $birthPath = $birthFile->storeAs($uploadPath, $birthName, \'public\');
            $data[\'birthCertificate\'] = $birthPath;
        }

        if ($request->hasFile(\'wholeBodyPicture\')) {
            $wholeBodyFile = $request->file(\'wholeBodyPicture\');
            $wholeBodyName = \'whole_body_picture_\' . \\time() . \'.\' . $wholeBodyFile->getClientOriginalExtension();
            $wholeBodyPath = $wholeBodyFile->storeAs($uploadPath, $wholeBodyName, \'public\');
            $data[\'wholeBodyPicture\'] = $wholeBodyPath;
        }

        if ($request->hasFile(\'affidavit\')) {
            $affidavitFile = $request->file(\'affidavit\');
            $affidavitName = \'affidavit_\' . \\time() . \'.\' . $affidavitFile->getClientOriginalExtension();
            $affidavitPath = $affidavitFile->storeAs($uploadPath, $affidavitName, \'public\');
            $data[\'affidavit\'] = $affidavitPath;
        }

        if ($request->hasFile(\'barangayCertificate\')) {
            $barangayCertFile = $request->file(\'barangayCertificate\');
            $barangayCertName = \'barangay_certificate_\' . \\time() . \'.\' . $barangayCertFile->getClientOriginalExtension();
            $barangayCertPath = $barangayCertFile->storeAs($uploadPath, $barangayCertName, \'public\');
            $data[\'barangayCertificate\'] = $barangayCertPath;
        }

        \\Illuminate\\Support\\Facades\\Log::info(\'Creating application with data\', [
            \'data\' => $data
        ]);

        $application = \\App\\Models\\Application::create($data);

        \\Illuminate\\Support\\Facades\\Log::info(\'Application created successfully\', [
            \'application_id\' => $application->applicationID,
            \'application\' => $application->toArray()
        ]);

        return \\response()->json([
            \'message\' => \'Application submitted successfully\',
            \'application\' => $application
        ], 201);

    } catch (\\Exception $e) {
        \\Illuminate\\Support\\Facades\\Log::error(\'Application submission failed\', [
            \'error\' => $e->getMessage(),
            \'trace\' => $e->getTraceAsString()
        ]);
        
        return \\response()->json([
            \'error\' => \'Failed to submit application\',
            \'message\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007210000000000000000";}";s:4:"hash";s:44:"do8Aagu/5ZHwy27zkE3Lf3rimty69nqIyRLG9AsD644=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::1TVxnNhmqPoOpAtq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DhrTPbQAGlhwuCwt' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-file/{messageId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1160:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:941:"function($messageId) {
    try {
        $message = \\App\\Models\\SupportTicketMessage::find($messageId);
        if (!$message || !$message->hasAttachment()) {
            return \\response()->json([\'error\' => \'No attachment found\'], 404);
        }
        
        $filePath = \\storage_path(\'app/public/\' . $message->attachment_path);
        if (!\\file_exists($filePath)) {
            return \\response()->json([\'error\' => \'File not found: \' . $filePath], 404);
        }
        
        $fileContent = \\file_get_contents($filePath);
        $mimeType = $message->attachment_type ?: \\mime_content_type($filePath);
        
        return \\response($fileContent)
            ->header(\'Content-Type\', $mimeType)
            ->header(\'Content-Disposition\', \'inline; filename="\' . $message->attachment_name . \'"\');
    } catch (\\Exception $e) {
        return \\response()->json([\'error\' => $e->getMessage()], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007230000000000000000";}";s:4:"hash";s:44:"flumIRRmNIOTf1xb80YyYRxWIdJfmk1g0ANOeMLv43k=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::DhrTPbQAGlhwuCwt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::F8frFTGNvNVDQiPg' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-document-file/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1608:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1388:"function($id) {
    try {
        $memberDocument = \\App\\Models\\MemberDocument::find($id);
        
        if (!$memberDocument) {
            return \\response()->json([\'error\' => \'Document not found\'], 404);
        }
        
        $filePath = \\storage_path(\'app/public/\' . $memberDocument->file_path);
        
        if (!\\file_exists($filePath)) {
            return \\response()->json([
                \'error\' => \'File not found\',
                \'file_path\' => $filePath,
                \'member_document\' => $memberDocument
            ], 404);
        }

        // Get file info
        $fileSize = \\filesize($filePath);
        $mimeType = \\mime_content_type($filePath);
        
        // Set appropriate headers
        $headers = [
            \'Content-Type\' => $mimeType,
            \'Content-Length\' => $fileSize,
            \'Content-Disposition\' => \'inline; filename="\' . $memberDocument->file_name . \'"\',
            \'Cache-Control\' => \'private, max-age=3600\',
            \'Pragma\' => \'private\'
        ];

        // Return file response with proper headers
        return \\response()->file($filePath, $headers);
        
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Error serving file: \' . $e->getMessage(),
            \'trace\' => $e->getTraceAsString()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007250000000000000000";}";s:4:"hash";s:44:"6aN8k/OhPjSy6XksCobALB031Me2YfCXR5xZOzdb14M=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::F8frFTGNvNVDQiPg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::b7Eqr8cDp0qa2qto' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-storage-config',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1919:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1699:"function() {
    try {
        $storagePath = \\storage_path(\'app/public\');
        $publicPath = \\public_path(\'storage\');
        
        $info = [
            \'storage_path\' => $storagePath,
            \'public_path\' => $publicPath,
            \'storage_exists\' => \\is_dir($storagePath),
            \'public_storage_exists\' => \\is_dir($publicPath),
            \'storage_link_exists\' => \\is_link($publicPath),
            \'storage_writable\' => \\is_writable($storagePath),
            \'public_writable\' => \\is_writable($publicPath),
        ];
        
        // List some files in storage
        if (\\is_dir($storagePath)) {
            $files = [];
            $iterator = new \\RecursiveIteratorIterator(
                new \\RecursiveDirectoryIterator($storagePath, \\RecursiveDirectoryIterator::SKIP_DOTS),
                \\RecursiveIteratorIterator::SELF_FIRST
            );
            
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $files[] = [
                        \'path\' => \\str_replace($storagePath, \'\', $file->getPathname()),
                        \'size\' => $file->getSize(),
                        \'modified\' => \\date(\'Y-m-d H:i:s\', $file->getMTime())
                    ];
                }
                
                if (\\count($files) >= 10) break; // Limit to 10 files
            }
            
            $info[\'sample_files\'] = $files;
        }
        
        return \\response()->json($info);
        
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Error checking storage: \' . $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007270000000000000000";}";s:4:"hash";s:44:"Shi3XuFir9xolmiRSppSltNVSw1K+Qesck9Qm0k7YnM=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::b7Eqr8cDp0qa2qto',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::u0J4VkNa34aaT9PC' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/documents/file/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getDocumentFile',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getDocumentFile',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::u0J4VkNa34aaT9PC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::kxwUkwMJjXFuMpEF' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/support-tickets/messages/{messageId}/download',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@downloadAttachment',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@downloadAttachment',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::kxwUkwMJjXFuMpEF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DWMFFDCH6Jsjg5KD' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/application-file/{applicationId}/{fileType}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2939:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2719:"function($applicationId, $fileType) {
    try {
        $application = \\App\\Models\\Application::findOrFail($applicationId);
        
        // Map file types to database fields
        $fileFieldMap = [
            \'idPicture\' => \'idPicture\',
            \'medicalCertificate\' => \'medicalCertificate\',
            \'barangayClearance\' => \'barangayClearance\',
            \'clinicalAbstract\' => \'clinicalAbstract\',
            \'voterCertificate\' => \'voterCertificate\',
            \'birthCertificate\' => \'birthCertificate\',
            \'wholeBodyPicture\' => \'wholeBodyPicture\',
            \'affidavit\' => \'affidavit\',
            \'barangayCertificate\' => \'barangayCertificate\'
        ];
        
        if (!isset($fileFieldMap[$fileType])) {
            return \\response()->json([
                \'error\' => \'Invalid file type\',
                \'valid_types\' => \\array_keys($fileFieldMap)
            ], 400);
        }
        
        $fileField = $fileFieldMap[$fileType];
        $filePath = $application->$fileField;
        
        if (!$filePath) {
            return \\response()->json([
                \'error\' => \'File not found for this application\',
                \'application_id\' => $applicationId,
                \'file_type\' => $fileType
            ], 404);
        }
        
        $fullFilePath = \\storage_path(\'app/public/\' . $filePath);
        
        if (!\\file_exists($fullFilePath)) {
            return \\response()->json([
                \'error\' => \'File not found on disk\',
                \'file_path\' => $fullFilePath,
                \'application_id\' => $applicationId,
                \'file_type\' => $fileType
            ], 404);
        }

        // Get file info
        $fileSize = \\filesize($fullFilePath);
        $mimeType = \\mime_content_type($fullFilePath);
        
        // Generate filename
        $fileName = $fileType . \'_\' . $application->firstName . \'_\' . $application->lastName . \'.\' . \\pathinfo($fullFilePath, PATHINFO_EXTENSION);
        
        // Set appropriate headers
        $headers = [
            \'Content-Type\' => $mimeType,
            \'Content-Length\' => $fileSize,
            \'Content-Disposition\' => \'inline; filename="\' . $fileName . \'"\',
            \'Cache-Control\' => \'private, max-age=3600\',
            \'Pragma\' => \'private\'
        ];

        // Return file response with proper headers
        return \\response()->file($fullFilePath, $headers);
        
    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Error serving application file: \' . $e->getMessage(),
            \'trace\' => $e->getTraceAsString()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000072b0000000000000000";}";s:4:"hash";s:44:"hr5VAAcfl6EQ0pSsHFgiEa4z3dimjT8oF3lcil2F/+c=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::DWMFFDCH6Jsjg5KD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::kWdZAd2JA9eOWxXP' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/user',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:305:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:87:"function (\\Illuminate\\Http\\Request $request) {
        return $request->user();
    }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000070d0000000000000000";}";s:4:"hash";s:44:"By91w+TNHi8X54n+usCyBhTzbhPfDNGkBxtdlKUrVY4=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::kWdZAd2JA9eOWxXP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'pwd-members.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-members',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'pwd-members.index',
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@index',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'pwd-members.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/pwd-members',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'pwd-members.store',
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@store',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'pwd-members.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-members/{pwd_member}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'pwd-members.show',
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@show',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'pwd-members.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/pwd-members/{pwd_member}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'pwd-members.update',
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@update',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'pwd-members.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/pwd-members/{pwd_member}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'pwd-members.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FHoK58ae9ynkFgmb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-members/{id}/applications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@getApplications',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@getApplications',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::FHoK58ae9ynkFgmb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lePPXfkUclQ7y6gr' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-members/{id}/complaints',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@getComplaints',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@getComplaints',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::lePPXfkUclQ7y6gr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::pl26qrqrGAPLu5vw' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/pwd-members/{id}/benefit-claims',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\PWDMemberController@getBenefitClaims',
        'controller' => 'App\\Http\\Controllers\\API\\PWDMemberController@getBenefitClaims',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::pl26qrqrGAPLu5vw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Dtlhkp5KMsG2Yrvx' => 
    array (
      'methods' => 
      array (
        0 => 'PATCH',
      ),
      'uri' => 'api/complaints/{id}/status',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ComplaintController@updateStatus',
        'controller' => 'App\\Http\\Controllers\\API\\ComplaintController@updateStatus',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Dtlhkp5KMsG2Yrvx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefits.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/benefits',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefits.store',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitController@store',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefits.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefits/{benefit}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefits.show',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitController@show',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefits.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/benefits/{benefit}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefits.update',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitController@update',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefits.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/benefits/{benefit}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefits.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefit-claims.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/benefit-claims/{benefit_claim}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefit-claims.show',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitClaimController@show',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitClaimController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefit-claims.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/benefit-claims/{benefit_claim}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefit-claims.update',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitClaimController@update',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitClaimController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'benefit-claims.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/benefit-claims/{benefit_claim}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'benefit-claims.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\BenefitClaimController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\BenefitClaimController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::pRrUUvoloEK9wiuu' => 
    array (
      'methods' => 
      array (
        0 => 'PATCH',
      ),
      'uri' => 'api/announcements/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnnouncementController@update',
        'controller' => 'App\\Http\\Controllers\\API\\AnnouncementController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::pRrUUvoloEK9wiuu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lQbXjyiRhzq783mU' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reports/generate/{type}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@generateReport',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@generateReport',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::lQbXjyiRhzq783mU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::7hXX9BOPnVyglicz' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/barangay-stats/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getBarangayStats',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getBarangayStats',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::7hXX9BOPnVyglicz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::CnA1p9iVatMORypb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/pwd-masterlist/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getPWDMasterlist',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getPWDMasterlist',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::CnA1p9iVatMORypb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cRjVDVSidOuJQKfV' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/application-status/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getApplicationStatusReport',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getApplicationStatusReport',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::cRjVDVSidOuJQKfV',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::pA06VNfUiY5l3sUL' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/disability-distribution/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getDisabilityDistribution',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getDisabilityDistribution',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::pA06VNfUiY5l3sUL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::xoNxrKeidXDa2x37' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/age-group-analysis/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getAgeGroupAnalysis',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getAgeGroupAnalysis',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::xoNxrKeidXDa2x37',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GvnNHdVIRkMMwKST' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/benefit-distribution/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getBenefitDistribution',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getBenefitDistribution',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::GvnNHdVIRkMMwKST',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GZO091p9YLs6nbuq' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/monthly-activity/{barangay}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getMonthlyActivitySummary',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getMonthlyActivitySummary',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::GZO091p9YLs6nbuq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XSkys8HXJrrCfeOv' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/city-wide-stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getCityWideStats',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getCityWideStats',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::XSkys8HXJrrCfeOv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::s4tDxaU94kp9qja5' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/barangay-performance',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getBarangayPerformance',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getBarangayPerformance',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::s4tDxaU94kp9qja5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::RBXtluGUPrvmuzqp' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/all-barangays',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@getAllBarangays',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@getAllBarangays',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::RBXtluGUPrvmuzqp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eCoaWDmpjfQJ7Jyz' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reports/{id}/download',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\ReportController@downloadReport',
        'controller' => 'App\\Http\\Controllers\\API\\ReportController@downloadReport',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::eCoaWDmpjfQJ7Jyz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::NAEACmJ6tAB3KUcR' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/audit-logs',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuditLogController@index',
        'controller' => 'App\\Http\\Controllers\\API\\AuditLogController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::NAEACmJ6tAB3KUcR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::h0FAJvSuT8vaihib' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/audit-logs/user/{userId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuditLogController@getByUser',
        'controller' => 'App\\Http\\Controllers\\API\\AuditLogController@getByUser',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::h0FAJvSuT8vaihib',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4Z5YhG0TKRbKCHUk' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/audit-logs/action/{action}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AuditLogController@getByAction',
        'controller' => 'App\\Http\\Controllers\\API\\AuditLogController@getByAction',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::4Z5YhG0TKRbKCHUk',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ZagNqTKT74LlKc8h' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/support-tickets/archived',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@archived',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@archived',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ZagNqTKT74LlKc8h',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'support-tickets.index' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/support-tickets',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'support-tickets.index',
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@index',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'support-tickets.store' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/support-tickets',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'support-tickets.store',
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@store',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'support-tickets.show' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/support-tickets/{support_ticket}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'support-tickets.show',
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@show',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@show',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'support-tickets.update' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'PATCH',
      ),
      'uri' => 'api/support-tickets/{support_ticket}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'support-tickets.update',
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@update',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'support-tickets.destroy' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/support-tickets/{support_ticket}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'as' => 'support-tickets.destroy',
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::WL594EZz61o1twbw' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/support-tickets/{id}/messages',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@addMessage',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@addMessage',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::WL594EZz61o1twbw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::aOckK2k0A9dAdhQK' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/support-tickets/messages/{messageId}/force-download',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\SupportTicketController@forceDownloadAttachment',
        'controller' => 'App\\Http\\Controllers\\API\\SupportTicketController@forceDownloadAttachment',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::aOckK2k0A9dAdhQK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Vpy248rOjFN8ioT9' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard/test',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DashboardController@test',
        'controller' => 'App\\Http\\Controllers\\API\\DashboardController@test',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Vpy248rOjFN8ioT9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0FFnP9aqa5rJF5b3' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard/recent-activities',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DashboardController@getRecentActivities',
        'controller' => 'App\\Http\\Controllers\\API\\DashboardController@getRecentActivities',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::0FFnP9aqa5rJF5b3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::RtO0W4iFT7I9gEs5' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/dashboard/barangay-contacts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DashboardController@getBarangayContacts',
        'controller' => 'App\\Http\\Controllers\\API\\DashboardController@getBarangayContacts',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::RtO0W4iFT7I9gEs5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EDuqGLTktNUObrAn' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/gmail/auth-url',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\GmailController@getAuthUrl',
        'controller' => 'App\\Http\\Controllers\\API\\GmailController@getAuthUrl',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::EDuqGLTktNUObrAn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BB94t1CGpHNoZORA' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/gmail/callback',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\GmailController@handleCallback',
        'controller' => 'App\\Http\\Controllers\\API\\GmailController@handleCallback',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::BB94t1CGpHNoZORA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cm6YqJxWjNIf0ym0' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/gmail/test',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\GmailController@testConnection',
        'controller' => 'App\\Http\\Controllers\\API\\GmailController@testConnection',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::cm6YqJxWjNIf0ym0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YbHEwLqnFBGiOwzO' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/gmail/status',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\GmailController@getStatus',
        'controller' => 'App\\Http\\Controllers\\API\\GmailController@getStatus',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::YbHEwLqnFBGiOwzO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ZaURc4xGPYWZYwOD' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/analytics/suggestions',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnalyticsController@getAutomatedSuggestions',
        'controller' => 'App\\Http\\Controllers\\API\\AnalyticsController@getAutomatedSuggestions',
        'namespace' => NULL,
        'prefix' => 'api/analytics',
        'where' => 
        array (
        ),
        'as' => 'generated::ZaURc4xGPYWZYwOD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ygAvclvPDow45hTV' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/analytics/suggestions/category/{category}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnalyticsController@getCategorySuggestions',
        'controller' => 'App\\Http\\Controllers\\API\\AnalyticsController@getCategorySuggestions',
        'namespace' => NULL,
        'prefix' => 'api/analytics',
        'where' => 
        array (
        ),
        'as' => 'generated::ygAvclvPDow45hTV',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::2FtTe2hZm0c4FIid' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/analytics/suggestions/summary',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnalyticsController@getSuggestionSummary',
        'controller' => 'App\\Http\\Controllers\\API\\AnalyticsController@getSuggestionSummary',
        'namespace' => NULL,
        'prefix' => 'api/analytics',
        'where' => 
        array (
        ),
        'as' => 'generated::2FtTe2hZm0c4FIid',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gARJZGpOAcPxatxF' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/analytics/suggestions/high-priority',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnalyticsController@getHighPrioritySuggestions',
        'controller' => 'App\\Http\\Controllers\\API\\AnalyticsController@getHighPrioritySuggestions',
        'namespace' => NULL,
        'prefix' => 'api/analytics',
        'where' => 
        array (
        ),
        'as' => 'generated::gARJZGpOAcPxatxF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mtTTTLmeGILJ3CEK' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/analytics/transaction-analysis',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\AnalyticsController@getTransactionAnalysis',
        'controller' => 'App\\Http\\Controllers\\API\\AnalyticsController@getTransactionAnalysis',
        'namespace' => NULL,
        'prefix' => 'api/analytics',
        'where' => 
        array (
        ),
        'as' => 'generated::mtTTTLmeGILJ3CEK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::WDJ30P5Jf1uU20Qi' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/documents',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@index',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@index',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::WDJ30P5Jf1uU20Qi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::nLf2S4vaV14PjG8L' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/documents',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@store',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@store',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::nLf2S4vaV14PjG8L',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YAFMwVZHjM4V0gQR' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/documents/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@update',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@update',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::YAFMwVZHjM4V0gQR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oaWkYYnP1pXQLHUV' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/documents/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@destroy',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@destroy',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::oaWkYYnP1pXQLHUV',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::z0FlJEn4wQXBtvsD' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/documents/pending-reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getPendingReviews',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getPendingReviews',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::z0FlJEn4wQXBtvsD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1m7F6WyEbIfyFue1' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/documents/{id}/review',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@reviewDocument',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@reviewDocument',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::1m7F6WyEbIfyFue1',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iaSBhTkjFfA2WcEN' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/documents/my-documents',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getMemberDocuments',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getMemberDocuments',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::iaSBhTkjFfA2WcEN',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::AH0IhBVce8GHkoQ5' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/documents/upload',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@uploadDocument',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@uploadDocument',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::AH0IhBVce8GHkoQ5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mTaT7IzugucFuRdP' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/documents/notifications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getNotifications',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@getNotifications',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::mTaT7IzugucFuRdP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::k7A9X67IC3VjgIBI' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/documents/notifications/{id}/read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentManagementController@markNotificationAsRead',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentManagementController@markNotificationAsRead',
        'namespace' => NULL,
        'prefix' => 'api/documents',
        'where' => 
        array (
        ),
        'as' => 'generated::k7A9X67IC3VjgIBI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::s7Bxc2rbNQtAKml5' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/admin/migrate-documents',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentMigrationController@migrateApplicationDocuments',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentMigrationController@migrateApplicationDocuments',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::s7Bxc2rbNQtAKml5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::obu0iyjqeq2TpffT' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/admin/migration-status',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'App\\Http\\Controllers\\API\\DocumentMigrationController@getMigrationStatus',
        'controller' => 'App\\Http\\Controllers\\API\\DocumentMigrationController@getMigrationStatus',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::obu0iyjqeq2TpffT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4pLXela2mTcwwYYo' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/admin/migrate-all-documents',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:713:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:494:"function (\\Illuminate\\Http\\Request $request) {
            if ($request->user()->role !== \'Admin\' && $request->user()->role !== \'SuperAdmin\') {
                return \\response()->json([\'error\' => \'Unauthorized\'], 403);
            }
            
            $documentMigrationService = new \\App\\Services\\DocumentMigrationService();
            $result = $documentMigrationService->migrateAllApprovedApplications();
            
            return \\response()->json($result);
        }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007700000000000000000";}";s:4:"hash";s:44:"fVeU9lmKXWF/Ci/WrPsoPVh6sjNrsE1iUehAEMa/auc=";}}',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::4pLXela2mTcwwYYo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IGLi532pbz3Jg9jb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/notifications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:963:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:744:"function (\\Illuminate\\Http\\Request $request) {
            try {
                $user = $request->user();
                $notifications = \\App\\Models\\Notification::forUser($user->userID)
                    ->orderBy(\'created_at\', \'desc\')
                    ->get();
                
                return \\response()->json([
                    \'success\' => true,
                    \'notifications\' => $notifications
                ]);
            } catch (\\Exception $e) {
                return \\response()->json([
                    \'success\' => false,
                    \'error\' => \'Failed to fetch notifications\',
                    \'message\' => $e->getMessage()
                ], 500);
            }
        }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007720000000000000000";}";s:4:"hash";s:44:"ZsuokrbdxIttbLGAg/2NqOoeINJQY9iU75q3XuRQrZo=";}}',
        'namespace' => NULL,
        'prefix' => 'api/notifications',
        'where' => 
        array (
        ),
        'as' => 'generated::IGLi532pbz3Jg9jb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jt1Fzkw5pJr7JWRu' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/notifications/unread',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:938:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:719:"function (\\Illuminate\\Http\\Request $request) {
            try {
                $user = $request->user();
                $unreadCount = \\App\\Models\\Notification::forUser($user->userID)
                    ->unread()
                    ->count();
                
                return \\response()->json([
                    \'success\' => true,
                    \'unread_count\' => $unreadCount
                ]);
            } catch (\\Exception $e) {
                return \\response()->json([
                    \'success\' => false,
                    \'error\' => \'Failed to fetch unread count\',
                    \'message\' => $e->getMessage()
                ], 500);
            }
        }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007740000000000000000";}";s:4:"hash";s:44:"UoZ8S5M7YEuyGrROUWKuVF5A5kHmbaXkqfA2R5NNlZY=";}}',
        'namespace' => NULL,
        'prefix' => 'api/notifications',
        'where' => 
        array (
        ),
        'as' => 'generated::jt1Fzkw5pJr7JWRu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MOwrfB7tUTEv0hN5' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/notifications/{id}/mark-read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1003:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:784:"function (\\Illuminate\\Http\\Request $request, $id) {
            try {
                $user = $request->user();
                $notification = \\App\\Models\\Notification::forUser($user->userID)
                    ->findOrFail($id);
                
                $notification->markAsRead();
                
                return \\response()->json([
                    \'success\' => true,
                    \'message\' => \'Notification marked as read\'
                ]);
            } catch (\\Exception $e) {
                return \\response()->json([
                    \'success\' => false,
                    \'error\' => \'Failed to mark notification as read\',
                    \'message\' => $e->getMessage()
                ], 500);
            }
        }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007760000000000000000";}";s:4:"hash";s:44:"6Zrbc7eIBfNdZggFJ0IW8SJYxjQQJ5RBst7uLE9vSLM=";}}',
        'namespace' => NULL,
        'prefix' => 'api/notifications',
        'where' => 
        array (
        ),
        'as' => 'generated::MOwrfB7tUTEv0hN5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wxA2evgCGIUT8Vxz' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/notifications/mark-all-read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth:sanctum',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1066:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:847:"function (\\Illuminate\\Http\\Request $request) {
            try {
                $user = $request->user();
                \\App\\Models\\Notification::forUser($user->userID)
                    ->unread()
                    ->update([
                        \'is_read\' => true,
                        \'read_at\' => \\now()
                    ]);
                
                return \\response()->json([
                    \'success\' => true,
                    \'message\' => \'All notifications marked as read\'
                ]);
            } catch (\\Exception $e) {
                return \\response()->json([
                    \'success\' => false,
                    \'error\' => \'Failed to mark all notifications as read\',
                    \'message\' => $e->getMessage()
                ], 500);
            }
        }";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007780000000000000000";}";s:4:"hash";s:44:"WS4ZhQdaFyp0kXntVurvTV8P1CUD2AIyHBvWNhRlAw0=";}}',
        'namespace' => NULL,
        'prefix' => 'api/notifications',
        'where' => 
        array (
        ),
        'as' => 'generated::wxA2evgCGIUT8Vxz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::s0WJfvmbjjzSlZIW' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/api/test-basic',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:373:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:154:"function () {
    return \\response()->json([
        \'message\' => \'Server is working!\',
        \'status\' => \'OK\',
        \'time\' => \\now()
    ]);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000072d0000000000000000";}";s:4:"hash";s:44:"TiutYJpehi1eCog51EBTevHZWPxM9wwTvTBcVztdY3Y=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::s0WJfvmbjjzSlZIW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gJcBbPRQvhQtqAV5' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/api/test-email/{email}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1102:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:883:"function ($email) {
    try {
        $emailService = new \\App\\Services\\EmailService();
        
        $result = $emailService->sendApplicationApprovalEmail([
            \'firstName\' => \'Test\',
            \'lastName\' => \'User\',
            \'email\' => $email,
            \'username\' => $email,
            \'password\' => \'test123\',
            \'pwdId\' => \'PWD-000001\',
            \'loginUrl\' => \'http://localhost:3000/login\'
        ]);

        return \\response()->json([
            \'message\' => \'Email test completed\',
            \'email\' => $email,
            \'sent\' => $result,
            \'from\' => \'sarinonhoelivan29@gmail.com\'
        ]);

    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Email test failed\',
            \'message\' => $e->getMessage(),
            \'email\' => $email
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000075d0000000000000000";}";s:4:"hash";s:44:"r339jdk5u6IJ/8AHHxl/QTvUrte2hBGm5JErVXaF6ls=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::gJcBbPRQvhQtqAV5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::INcSl2ZtGbr46FPR' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/api/test-admin-approve/{applicationId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:4969:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:4749:"function ($applicationId) {
    try {
        $application = \\App\\Models\\Application::findOrFail($applicationId);
        
        // Generate secure random password
        $randomPassword = \\Illuminate\\Support\\Str::random(12);
        
        // Check if user already exists
        $existingUser = \\App\\Models\\User::where(\'email\', $application->email)->first();
        
        if ($existingUser) {
            // User already exists, update their role to PWDMember and password
            $existingUser->update([
                \'role\' => \'PWDMember\',
                \'status\' => \'active\',
                \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword)
            ]);
            $pwdUser = $existingUser;
        } else {
            // Create new PWD Member User Account
            $pwdUser = \\App\\Models\\User::create([
                \'username\' => $application->email, // Use email as username
                \'email\' => $application->email,
                \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword),
                \'role\' => \'PWDMember\',
                \'status\' => \'active\'
            ]);
        }

        // Generate unique PWD ID
        $pwdId = \'PWD-\' . \\str_pad($pwdUser->userID, 6, \'0\', STR_PAD_LEFT);

        // Update application status
        $application->update([
            \'status\' => \'Approved\',
            \'remarks\' => \'Test approval - Account created\',
            \'pwdID\' => $pwdUser->userID
        ]);

        // Migrate documents from application to member_documents table
        $documentMigrationService = new \\App\\Services\\DocumentMigrationService();
        $migrationResult = $documentMigrationService->migrateApplicationDocuments($application, $pwdUser);

        // Send email notification
        try {
            $emailService = new \\App\\Services\\EmailService();
            $emailSent = $emailService->sendApplicationApprovalEmail([
                \'firstName\' => $application->firstName,
                \'lastName\' => $application->lastName,
                \'email\' => $application->email,
                \'username\' => $pwdUser->username,
                \'password\' => $randomPassword,
                \'pwdId\' => $pwdId,
                \'loginUrl\' => \\config(\'app.frontend_url\', \'http://localhost:3000/login\')
            ]);

            return \\response()->json([
                \'message\' => \'✅ ADMIN APPROVAL SUCCESSFUL!\',
                \'details\' => [
                    \'application_approved\' => true,
                    \'user_account_created\' => true,
                    \'documents_migrated\' => $migrationResult[\'success\'] ?? false,
                    \'documents_migrated_count\' => $migrationResult[\'migrated_count\'] ?? 0,
                    \'email_sent\' => $emailSent
                ],
                \'application\' => [
                    \'id\' => $application->applicationID,
                    \'name\' => $application->firstName . \' \' . $application->lastName,
                    \'email\' => $application->email,
                    \'status\' => $application->status
                ],
                \'user_account\' => [
                    \'userID\' => $pwdUser->userID,
                    \'email\' => $pwdUser->email,
                    \'role\' => $pwdUser->role,
                    \'status\' => $pwdUser->status,
                    \'pwdId\' => $pwdId
                ],
                \'login_credentials\' => [
                    \'email\' => $application->email,
                    \'password\' => $randomPassword,
                    \'note\' => \'Password is hashed in database for security\'
                ],
                \'email_status\' => $emailSent ? \'Email sent successfully\' : \'Email failed to send\'
            ]);

        } catch (\\Exception $mailError) {
            return \\response()->json([
                \'message\' => \'✅ ADMIN APPROVAL SUCCESSFUL! (Email failed)\',
                \'details\' => [
                    \'application_approved\' => true,
                    \'user_account_created\' => true,
                    \'email_sent\' => false,
                    \'email_error\' => $mailError->getMessage()
                ],
                \'application\' => $application,
                \'user_account\' => $pwdUser,
                \'login_credentials\' => [
                    \'email\' => $application->email,
                    \'password\' => $randomPassword
                ]
            ]);
        }

    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to approve application\',
            \'message\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000077a0000000000000000";}";s:4:"hash";s:44:"t5QCLoFxPin04NiEOGnOj/bxPvthDAblR6bK0dk0vjo=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::INcSl2ZtGbr46FPR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gR07cNvARcZ2hC3R' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/api/test-richard-pwd1',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2445:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2225:"function () {
    try {
        // Check if Richard Carandang exists in PWD members
        $richard = \\App\\Models\\PWDMember::where(\'firstName\', \'Richard\')
            ->where(\'lastName\', \'Carandang\')
            ->first();
        
        if ($richard) {
            return \\response()->json([
                \'success\' => true,
                \'message\' => \'Richard Carandang found\',
                \'member\' => [
                    \'id\' => $richard->id,
                    \'userID\' => $richard->userID,
                    \'pwd_id\' => $richard->pwd_id,
                    \'firstName\' => $richard->firstName,
                    \'lastName\' => $richard->lastName,
                    \'birthDate\' => $richard->birthDate,
                    \'disabilityType\' => $richard->disabilityType,
                    \'barangay\' => $richard->barangay
                ]
            ]);
        } else {
            // Check if he exists in applications
            $application = \\App\\Models\\Application::where(\'firstName\', \'Richard\')
                ->where(\'lastName\', \'Carandang\')
                ->first();
                
            if ($application) {
                return \\response()->json([
                    \'success\' => false,
                    \'message\' => \'Richard Carandang found in applications but not in PWD members\',
                    \'application\' => [
                        \'applicationID\' => $application->applicationID,
                        \'firstName\' => $application->firstName,
                        \'lastName\' => $application->lastName,
                        \'status\' => $application->status,
                        \'email\' => $application->email
                    ]
                ]);
            } else {
                return \\response()->json([
                    \'success\' => false,
                    \'message\' => \'Richard Carandang not found in database\'
                ]);
            }
        }
    } catch (\\Exception $e) {
        return \\response()->json([
            \'success\' => false,
            \'message\' => \'Error checking Richard Carandang\',
            \'error\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000077c0000000000000000";}";s:4:"hash";s:44:"49jq5164KgAexmCNMTFzwawOYFuFrgDAGdMb0suI/5w=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::gR07cNvARcZ2hC3R',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BrWUS3QrELvtmWo4' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/api/test-approve-application/{applicationId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:4390:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:4170:"function ($applicationId) {
    try {
        $application = \\App\\Models\\Application::findOrFail($applicationId);
        
        // Generate secure random password
        $randomPassword = \\Illuminate\\Support\\Str::random(12);
        
        // Check if user already exists
        $existingUser = \\App\\Models\\User::where(\'email\', $application->email)->first();
        
        if ($existingUser) {
            // User already exists, update their role to PWDMember and password
            $existingUser->update([
                \'role\' => \'PWDMember\',
                \'status\' => \'active\',
                \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword)
            ]);
            $pwdUser = $existingUser;
        } else {
            // Create new PWD Member User Account
            $pwdUser = \\App\\Models\\User::create([
                \'username\' => $application->email, // Use email as username
                \'email\' => $application->email,
                \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword),
                \'role\' => \'PWDMember\',
                \'status\' => \'active\'
            ]);
        }

        // Generate unique PWD ID
        $pwdId = \'PWD-\' . \\str_pad($pwdUser->userID, 6, \'0\', STR_PAD_LEFT);

        // Update application status
        $application->update([
            \'status\' => \'Approved\',
            \'remarks\' => \'Test approval - Account created\',
            \'pwdID\' => $pwdUser->userID
        ]);

        // Migrate documents from application to member_documents table
        $documentMigrationService = new \\App\\Services\\DocumentMigrationService();
        $migrationResult = $documentMigrationService->migrateApplicationDocuments($application, $pwdUser);

        // Send email notification
        try {
            $emailService = new \\App\\Services\\EmailService();
            $emailSent = $emailService->sendApplicationApprovalEmail([
                \'firstName\' => $application->firstName,
                \'lastName\' => $application->lastName,
                \'email\' => $application->email,
                \'username\' => $pwdUser->username,
                \'password\' => $randomPassword,
                \'pwdId\' => $pwdId,
                \'loginUrl\' => \\config(\'app.frontend_url\', \'http://localhost:3000/login\')
            ]);

            return \\response()->json([
                \'message\' => \'Application approved successfully! User account created and email sent.\',
                \'application\' => [
                    \'id\' => $application->applicationID,
                    \'name\' => $application->firstName . \' \' . $application->lastName,
                    \'email\' => $application->email,
                    \'status\' => $application->status
                ],
                \'user_account\' => [
                    \'userID\' => $pwdUser->userID,
                    \'email\' => $pwdUser->email,
                    \'role\' => $pwdUser->role,
                    \'status\' => $pwdUser->status,
                    \'pwdId\' => $pwdId
                ],
                \'login_credentials\' => [
                    \'email\' => $application->email,
                    \'password\' => $randomPassword,
                    \'note\' => \'Password is hashed in database for security\'
                ],
                \'email_sent\' => $emailSent
            ]);

        } catch (\\Exception $mailError) {
            return \\response()->json([
                \'message\' => \'Application approved and user account created, but email failed to send.\',
                \'error\' => $mailError->getMessage(),
                \'application\' => $application,
                \'user_account\' => $pwdUser,
                \'login_credentials\' => [
                    \'email\' => $application->email,
                    \'password\' => $randomPassword
                ]
            ]);
        }

    } catch (\\Exception $e) {
        return \\response()->json([
            \'error\' => \'Failed to approve application\',
            \'message\' => $e->getMessage()
        ], 500);
    }
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000077e0000000000000000";}";s:4:"hash";s:44:"U0sPPokWtUcKTSfRSdXd0acQcPhtQ+3378+mAr0vsG8=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::BrWUS3QrELvtmWo4',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lDBkHzWAx17V8n8q' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/{fallbackPlaceholder}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:356:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:137:"function () {
    return \\response()->json([
        \'message\' => \'API endpoint not found. Please check your request.\'
    ], 404);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007800000000000000000";}";s:4:"hash";s:44:"6SIs7IoCrnLSEPetdUJXwpdf4ZPPcM3yEHOBCvVd9Z8=";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::lDBkHzWAx17V8n8q',
      ),
      'fallback' => true,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
        'fallbackPlaceholder' => '.*',
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::nKoqSVIFdZB7Vevo' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-basic',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:440:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:224:"function () {
                return response()->json([
                    \'message\' => \'Server is working!\',
                    \'status\' => \'OK\',
                    \'time\' => now()
                ]);
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000006d10000000000000000";}";s:4:"hash";s:44:"5vgEhZsV+eQNZJFYmLHFrdc8wqP/LVZSDp1aV9lg1i4=";}}',
        'as' => 'generated::nKoqSVIFdZB7Vevo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Sh8uwcqYmklMjaVk' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/get-user-credentials/{email}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1476:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1259:"function ($email) {
                try {
                    $user = \\App\\Models\\User::where(\'email\', $email)->first();
                    
                    if (!$user) {
                        return response()->json([
                            \'error\' => \'User not found\',
                            \'email\' => $email
                        ], 404);
                    }

                    return response()->json([
                        \'user_found\' => true,
                        \'user_details\' => [
                            \'userID\' => $user->userID,
                            \'email\' => $user->email,
                            \'role\' => $user->role,
                            \'status\' => $user->status,
                            \'created_at\' => $user->created_at
                        ],
                        \'note\' => \'Password is hashed in database. Use the password from the approval email.\'
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to get user credentials\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007830000000000000000";}";s:4:"hash";s:44:"NlPGKSJnIBAtj59uK22hhwikPqxdA//mzCe+FfdaXG8=";}}',
        'as' => 'generated::Sh8uwcqYmklMjaVk',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mrJwykDyCKCN6BZz' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reset-password/{email}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2000:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1783:"function ($email) {
                try {
                    $user = \\App\\Models\\User::where(\'email\', $email)->first();
                    
                    if (!$user) {
                        return response()->json([
                            \'error\' => \'User not found\',
                            \'email\' => $email
                        ], 404);
                    }

                    // Generate a simple password for testing
                    $newPassword = \'password123\';
                    
                    // Update user password
                    $user->update([
                        \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($newPassword)
                    ]);

                    return response()->json([
                        \'message\' => \'Password reset successfully\',
                        \'user\' => [
                            \'userID\' => $user->userID,
                            \'email\' => $user->email,
                            \'role\' => $user->role,
                            \'status\' => $user->status
                        ],
                        \'new_password\' => $newPassword,
                        \'login_instructions\' => [
                            \'email\' => $email,
                            \'password\' => $newPassword,
                            \'redirect_to\' => $user->role === \'PWDMember\' ? \'/pwd-dashboard\' : \'/admin-dashboard\'
                        ]
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to reset password\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007850000000000000000";}";s:4:"hash";s:44:"t/1qqECy/xjNOB9IrAq7IS9T8HS029DwiErKnLoTXXY=";}}',
        'as' => 'generated::mrJwykDyCKCN6BZz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IuphVqBNHZiNQVmc' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/create-pwd-member/{email}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2292:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2075:"function ($email) {
                try {
                    $user = \\App\\Models\\User::where(\'email\', $email)->first();
                    if (!$user) {
                        return response()->json([\'error\' => \'User not found\'], 404);
                    }
                    
                    // Check if PwdMember already exists
                    $existingPwdMember = \\App\\Models\\PWDMember::where(\'userID\', $user->userID)->first();
                    if ($existingPwdMember) {
                        return response()->json([
                            \'message\' => \'PwdMember already exists\',
                            \'pwd_member_id\' => $existingPwdMember->id,
                            \'pwd_id\' => $existingPwdMember->pwd_id
                        ]);
                    }
                    
                    // Create PwdMember record
                    $pwdId = \'PWD-\' . str_pad($user->userID, 6, \'0\', STR_PAD_LEFT);
                    $pwdMember = \\App\\Models\\PWDMember::create([
                        \'userID\' => $user->userID,
                        \'pwd_id\' => $pwdId,
                        \'pwd_id_generated_at\' => now(),
                        \'firstName\' => \'Nhoel Ivan\',
                        \'lastName\' => \'Sarino\',
                        \'birthDate\' => \'1995-01-01\',
                        \'gender\' => \'Male\',
                        \'disabilityType\' => \'visual\',
                        \'address\' => \'Test Address\',
                        \'contactNumber\' => \'09917404331\'
                    ]);
                    
                    return response()->json([
                        \'message\' => \'PwdMember created successfully\',
                        \'pwd_member_id\' => $pwdMember->id,
                        \'pwd_id\' => $pwdMember->pwd_id,
                        \'user_id\' => $user->userID
                    ]);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007870000000000000000";}";s:4:"hash";s:44:"IqwEJG060OzNENAU0pQhUc2Vl5aaEu3lZVf9IHIqZWM=";}}',
        'as' => 'generated::IuphVqBNHZiNQVmc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::N3iHSYg3SaJ1Z7Ha' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-benefit-controller',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:744:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:528:"function () {
                try {
                    $controller = new \\App\\Http\\Controllers\\API\\BenefitController();
                    $response = $controller->index();
                    return $response;
                } catch (\\Exception $e) {
                    return response()->json([
                        \'success\' => false,
                        \'error\' => $e->getMessage(),
                        \'trace\' => $e->getTraceAsString()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007890000000000000000";}";s:4:"hash";s:44:"Pm0PpfWaOd2BRVSVUF2IQBDzkh2iBrXqGyReH3lLycM=";}}',
        'as' => 'generated::N3iHSYg3SaJ1Z7Ha',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BgYFI1SZ6Nx3bLlf' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-benefit-model',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:844:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:628:"function () {
                try {
                    $benefits = \\App\\Models\\Benefit::all();
                    return response()->json([
                        \'success\' => true,
                        \'count\' => count($benefits),
                        \'benefits\' => $benefits
                    ]);
                } catch (\\Exception $e) {
                    return response()->json([
                        \'success\' => false,
                        \'error\' => $e->getMessage(),
                        \'trace\' => $e->getTraceAsString()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000078b0000000000000000";}";s:4:"hash";s:44:"Q8gSYDkEP1J6SXUh+w3NNP9iMDQqpI7Z9doMYQoCP5A=";}}',
        'as' => 'generated::BgYFI1SZ6Nx3bLlf',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wy0KOfeTt8wuEEHw' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/check-benefits-table',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:973:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:757:"function () {
                try {
                    $benefits = \\App\\Models\\Benefit::all();
                    
                    return response()->json([
                        \'total_benefits\' => count($benefits),
                        \'benefits\' => $benefits,
                        \'table_structure\' => [
                            \'primary_key\' => \'benefitID\',
                            \'fillable_fields\' => [\'benefitType\', \'description\', \'schedule\'],
                            \'relationships\' => [\'benefitClaims\']
                        ]
                    ]);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000078d0000000000000000";}";s:4:"hash";s:44:"/yPMGeZDgHmjVkfB+I4hWDHTf5L3c845v3JqqrV47b8=";}}',
        'as' => 'generated::wy0KOfeTt8wuEEHw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iM8s5veSBTKi5WL5' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/check-pwd-birthdays',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:2435:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:2218:"function () {
                try {
                    $pwdMembers = \\App\\Models\\PWDMember::all();
                    
                    $membersWithBirthdays = [];
                    foreach ($pwdMembers as $member) {
                        $birthDate = $member->birthDate;
                        $month = $birthDate ? $birthDate->format(\'n\') : null; // 1-12
                        $quarter = $month ? ceil($month / 3) : null; // 1-4
                        
                        $membersWithBirthdays[] = [
                            \'id\' => $member->id,
                            \'userID\' => $member->userID,
                            \'pwd_id\' => $member->pwd_id,
                            \'firstName\' => $member->firstName,
                            \'lastName\' => $member->lastName,
                            \'birthDate\' => $birthDate ? $birthDate->format(\'Y-m-d\') : null,
                            \'birthMonth\' => $month,
                            \'quarter\' => $quarter,
                            \'age\' => $birthDate ? $birthDate->age : null
                        ];
                    }
                    
                    return response()->json([
                        \'total_members\' => count($membersWithBirthdays),
                        \'members\' => $membersWithBirthdays,
                        \'quarter_summary\' => [
                            \'Q1 (Jan-Mar)\' => count(array_filter($membersWithBirthdays, fn($m) => $m[\'quarter\'] == 1)),
                            \'Q2 (Apr-Jun)\' => count(array_filter($membersWithBirthdays, fn($m) => $m[\'quarter\'] == 2)),
                            \'Q3 (Jul-Sep)\' => count(array_filter($membersWithBirthdays, fn($m) => $m[\'quarter\'] == 3)),
                            \'Q4 (Oct-Dec)\' => count(array_filter($membersWithBirthdays, fn($m) => $m[\'quarter\'] == 4)),
                            \'No Birth Date\' => count(array_filter($membersWithBirthdays, fn($m) => $m[\'birthDate\'] === null))
                        ]
                    ]);
                } catch (\\Exception $e) {
                    return response()->json([\'error\' => $e->getMessage()], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000078f0000000000000000";}";s:4:"hash";s:44:"PMnfhpZpg6nRXdjsz8YBuxFy+SDAIriAGkrQIWnwXJ8=";}}',
        'as' => 'generated::iM8s5veSBTKi5WL5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::t1cJeXLyJ3PsJ1pO' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/test-login',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1646:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1429:"function (\\Illuminate\\Http\\Request $request) {
                try {
                    $credentials = $request->only([\'email\', \'password\']);
                    
                    if (\\Illuminate\\Support\\Facades\\Auth::attempt($credentials)) {
                        $user = \\Illuminate\\Support\\Facades\\Auth::user();
                        
                        return response()->json([
                            \'login_successful\' => true,
                            \'user\' => [
                                \'userID\' => $user->userID,
                                \'email\' => $user->email,
                                \'role\' => $user->role,
                                \'status\' => $user->status
                            ],
                            \'redirect_to\' => $user->role === \'PWDMember\' ? \'/pwd-dashboard\' : \'/admin-dashboard\'
                        ]);
                    } else {
                        return response()->json([
                            \'login_successful\' => false,
                            \'error\' => \'Invalid credentials\'
                        ], 401);
                    }

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Login failed\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007910000000000000000";}";s:4:"hash";s:44:"E7otYyIzo3dD+Yx5T26Wv5D2NnbnufsheAwiXJUEmbU=";}}',
        'as' => 'generated::t1cJeXLyJ3PsJ1pO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::t97AXxaCAMvLMzcg' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-admin-approve/{applicationId}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:6431:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:6214:"function ($applicationId) {
                try {
                    $application = \\App\\Models\\Application::findOrFail($applicationId);
                    
                    // Generate secure random password
                    $randomPassword = \\Illuminate\\Support\\Str::random(12);
                    
                    // Check if user already exists
                    $existingUser = \\App\\Models\\User::where(\'email\', $application->email)->first();
                    
                    if ($existingUser) {
                        // User already exists, update their role to PWDMember and password
                        $existingUser->update([
                            \'role\' => \'PWDMember\',
                            \'status\' => \'active\',
                            \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword)
                        ]);
                        $pwdUser = $existingUser;
                    } else {
                        // Create new PWD Member User Account
                        $pwdUser = \\App\\Models\\User::create([
                            \'username\' => $application->email, // Use email as username
                            \'email\' => $application->email,
                            \'password\' => \\Illuminate\\Support\\Facades\\Hash::make($randomPassword),
                            \'role\' => \'PWDMember\',
                            \'status\' => \'active\',
                            \'password_change_required\' => true
                        ]);
                    }

                    // Generate unique PWD ID
                    $pwdId = \'PWD-\' . str_pad($pwdUser->userID, 6, \'0\', STR_PAD_LEFT);

                    // Create PWD Member record
                    \\App\\Models\\PWDMember::create([
                        \'userID\' => $pwdUser->userID,
                        \'pwd_id\' => $pwdId,
                        \'pwd_id_generated_at\' => now(),
                        \'firstName\' => $application->firstName,
                        \'lastName\' => $application->lastName,
                        \'middleName\' => $application->middleName,
                        \'birthDate\' => $application->birthDate,
                        \'gender\' => $application->gender,
                        \'disabilityType\' => $application->disabilityType,
                        \'address\' => $application->address,
                        \'barangay\' => $application->barangay,
                        \'contactNumber\' => $application->contactNumber,
                        \'email\' => $application->email,
                        \'emergencyContact\' => $application->emergencyContact,
                        \'emergencyPhone\' => $application->emergencyPhone,
                        \'emergencyRelationship\' => $application->emergencyRelationship
                    ]);

                    // Update application status
                    $application->update([
                        \'status\' => \'Approved\',
                        \'remarks\' => \'Test approval - Account created\',
                        \'pwdID\' => $pwdUser->userID
                    ]);

                    // Send email notification using SMTP
                    try {
                        \\Illuminate\\Support\\Facades\\Mail::send(\'emails.application-approved\', [
                            \'firstName\' => $application->firstName,
                            \'lastName\' => $application->lastName,
                            \'email\' => $application->email,
                            \'username\' => $pwdUser->username,
                            \'password\' => $randomPassword,
                            \'pwdId\' => $pwdId,
                            \'loginUrl\' => \'http://localhost:3000/login\'
                        ], function ($message) use ($application) {
                            $message->to($application->email)
                                   ->subject(\'PWD Application Approved - Welcome!\')
                                   ->from(\'sarinonhoelivan29@gmail.com\', \'Cabuyao PDAO RMS\');
                        });

                        $emailSent = true;
                    } catch (\\Exception $mailError) {
                        $emailSent = false;
                        \\Illuminate\\Support\\Facades\\Log::error(\'Email sending failed: \' . $mailError->getMessage());
                    }

                    return response()->json([
                        \'message\' => \'✅ ADMIN APPROVAL SUCCESSFUL!\',
                        \'details\' => [
                            \'application_approved\' => true,
                            \'user_account_created\' => true,
                            \'email_sent\' => $emailSent
                        ],
                        \'application\' => [
                            \'id\' => $application->applicationID,
                            \'name\' => $application->firstName . \' \' . $application->lastName,
                            \'email\' => $application->email,
                            \'status\' => $application->status
                        ],
                        \'user_account\' => [
                            \'userID\' => $pwdUser->userID,
                            \'email\' => $pwdUser->email,
                            \'role\' => $pwdUser->role,
                            \'status\' => $pwdUser->status,
                            \'pwdId\' => $pwdId
                        ],
                        \'login_credentials\' => [
                            \'email\' => $application->email,
                            \'password\' => $randomPassword,
                            \'note\' => \'Password is hashed in database for security\'
                        ],
                        \'email_status\' => $emailSent ? \'Email sent successfully\' : \'Email failed to send\'
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'Failed to approve application\',
                        \'message\' => $e->getMessage()
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007930000000000000000";}";s:4:"hash";s:44:"B4L7Darqn64d0NSzVcZR8J5CN4m+IzbOlHpS1F5yaM0=";}}',
        'as' => 'generated::t97AXxaCAMvLMzcg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::maix3P0NlGp5kC4n' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-smtp/{email}',
      'action' => 
      array (
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:1687:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:1470:"function ($email) {
                try {
                    // Use Laravel\'s Mail facade directly (SMTP only)
                    \\Illuminate\\Support\\Facades\\Mail::send(\'emails.application-approved\', [
                        \'firstName\' => \'Test\',
                        \'lastName\' => \'User\',
                        \'email\' => $email,
                        \'username\' => $email,
                        \'password\' => \'test123\',
                        \'pwdId\' => \'PWD-000001\',
                        \'loginUrl\' => \'http://localhost:3000/login\'
                    ], function ($message) use ($email) {
                        $message->to($email)
                               ->subject(\'PWD Application Approved - Test\')
                               ->from(\'sarinonhoelivan29@gmail.com\', \'Cabuyao PDAO RMS\');
                    });

                    return response()->json([
                        \'message\' => \'SMTP email sent successfully!\',
                        \'email\' => $email,
                        \'from\' => \'sarinonhoelivan29@gmail.com\',
                        \'method\' => \'SMTP\'
                    ]);

                } catch (\\Exception $e) {
                    return response()->json([
                        \'error\' => \'SMTP email failed\',
                        \'message\' => $e->getMessage(),
                        \'email\' => $email
                    ], 500);
                }
            }";s:5:"scope";s:34:"App\\Providers\\RouteServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000007950000000000000000";}";s:4:"hash";s:44:"bAxDsAHgvq9KBvwRZQfeXewp+1qRBppH2be63fQS150=";}}',
        'as' => 'generated::maix3P0NlGp5kC4n',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::buRu4m4UDQN6W6M3' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => '/',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'web',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:264:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:46:"function () {
    return \\view(\'welcome\');
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000007990000000000000000";}";s:4:"hash";s:44:"bHv1PKpVEHx528b0QdEds1iQFsCL1sQwLGwDn+ZcQyE=";}}',
        'namespace' => NULL,
        'prefix' => '',
        'where' => 
        array (
        ),
        'as' => 'generated::buRu4m4UDQN6W6M3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ZoBBBfDu3DTtVAcZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'test-web',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'web',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:306:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:88:"function () {
    return \\response()->json([\'message\' => \'Web routes are working\']);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000079b0000000000000000";}";s:4:"hash";s:44:"xnypMOSdst1mIgMWw/90FvVlpR8r8SVS5xUWmghRjbY=";}}',
        'namespace' => NULL,
        'prefix' => '',
        'where' => 
        array (
        ),
        'as' => 'generated::ZoBBBfDu3DTtVAcZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Sa1fXf0a6Z3eUZB9' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test-web',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'web',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:307:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:89:"function () {
    return \\response()->json([\'message\' => \'API test via web routes\']);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000079d0000000000000000";}";s:4:"hash";s:44:"8yZ6hrPTgkw1xBnW0bhY1I61SI4xlsZxNxyXw2nTXUg=";}}',
        'namespace' => NULL,
        'prefix' => '',
        'where' => 
        array (
        ),
        'as' => 'generated::Sa1fXf0a6Z3eUZB9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'login' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'login',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'web',
        ),
        'uses' => 'O:47:"Laravel\\SerializableClosure\\SerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Signed":2:{s:12:"serializable";s:326:"O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:107:"function () {
    return \\response()->json([\'message\' => \'Please login to access this resource\'], 401);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000079f0000000000000000";}";s:4:"hash";s:44:"usStnCAOBg0Dzg14KttXrDXjL0HOllPHRQbCQ0bJaFM=";}}',
        'namespace' => NULL,
        'prefix' => '',
        'where' => 
        array (
        ),
        'as' => 'login',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
  ),
)
);
