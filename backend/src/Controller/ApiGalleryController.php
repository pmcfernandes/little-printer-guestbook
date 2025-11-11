<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Submission;

class ApiGalleryController extends AbstractController
{
    #[Route('/api/gallery', name: 'api_gallery', methods: ['GET'])]
    public function index(Request $request, ManagerRegistry $doctrine): JsonResponse
    {
        $repo = $doctrine->getRepository(Submission::class);

        $page = max(1, (int)$request->query->get('page', 1));
        $limit = max(1, min(200, (int)$request->query->get('limit', 20)));
        $offset = ($page - 1) * $limit;

        $qb = $repo->createQueryBuilder('s')
            ->orderBy('s.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        $results = $qb->getQuery()->getResult();

        $items = array_map(function (Submission $s) {
            return [
                'id' => $s->getId(),
                'name' => $s->getName(),
                'social_link' => $s->getSocialLink(),
                'filename' => '/uploads/'.$s->getFilename(),
                'created_at' => $s->getCreatedAt() ? $s->getCreatedAt()->format('c') : null,
            ];
        }, $results);

        $hasMore = count($results) === $limit;

        return $this->json(['items' => $items, 'hasMore' => $hasMore]);
    }

    #[Route('/api/gallery/{id}', name: 'api_gallery_detail', methods: ['GET'])]
    public function show(Request $request, ManagerRegistry $doctrine, $id): JsonResponse
    {
        $repo = $doctrine->getRepository(Submission::class);
        $s = $repo->find((int)$id);

        if (!$s) {
            return $this->json(['error' => 'Not found'], 404);
        }

        $item = [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'social_link' => $s->getSocialLink(),
            'filename' => ('/uploads/' . $s->getFilename()),
            'created_at' => $s->getCreatedAt() ? $s->getCreatedAt()->format('c') : null,
        ];

        return $this->json($item);
    }
}
