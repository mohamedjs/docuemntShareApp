<?php

namespace Modules\Auth\App\Services;

use Modules\Auth\App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function register(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        return $this->userRepository->create($data);
    }

    public function login(array $credentials)
    {
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return null;
        }

        return $token;
    }

    public function logout()
    {
        Auth::guard('api')->logout();
    }

    public function refresh()
    {
        return Auth::guard('api')->refresh();
    }

    public function me()
    {
        return Auth::guard('api')->user();
    }
}
