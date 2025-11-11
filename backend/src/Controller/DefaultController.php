<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    #[Route('/', name: 'app_default', methods: ['GET'])]
    public function index(): BinaryFileResponse
    {
        $path = $this->getParameter('kernel.project_dir') . '/public/index.html';
        return new BinaryFileResponse($path);
    }

    // Catch-all for frontend routes (let React Router handle client-side routes)
    #[Route('/{reactRouting}', name: 'app_spa_catchall', requirements: ['reactRouting' => '^(?!api|assets|uploads|_wdt|_profiler).*$'], methods: ['GET'])]
    public function catchAll(): BinaryFileResponse
    {
        $path = $this->getParameter('kernel.project_dir') . '/public/index.html';
        return new BinaryFileResponse($path);
    }
}
