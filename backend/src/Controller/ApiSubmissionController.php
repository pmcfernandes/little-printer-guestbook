<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Entity\Submission;

class ApiSubmissionController extends AbstractController
{
    #[Route('/api/submit', name: 'api_submit', methods: ['POST'])]
    public function submit(Request $request, EntityManagerInterface $em, ValidatorInterface $validator, LoggerInterface $logger): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        $required = ['name', 'email', 'image'];
        foreach ($required as $k) {
            if (empty($data[$k])) {
                return $this->json(['error' => "$k is required"], 400);
            }
        }

        $projectDir = $this->getParameter('kernel.project_dir');
        $uploadsDir = $projectDir.'/public/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        if (!preg_match('/^data:(.*?);base64,(.*)$/', $data['image'], $matches)) {
            return $this->json(['error' => 'Invalid image data'], 400);
        }

        $mime = $matches[1];
        $b64 = $matches[2];
        $ext = 'png';
        if ($mime === 'image/jpeg') $ext = 'jpg';

        $filename = 'ddd-'.time().'-'.substr(bin2hex(random_bytes(4)),0,8).'.'.$ext;
        $path = $uploadsDir.'/'.$filename;
        $decoded = base64_decode($b64);
        if ($decoded === false || file_put_contents($path, $decoded) === false) {
            $logger->error('Failed to write uploaded image', ['path' => $path]);
            return $this->json(['error' => 'Failed to write file'], 500);
        }

        $submission = new Submission();
        $submission->setName($data['name']);
        $submission->setEmail($data['email']);
        $submission->setSocialLink($data['social'] ?? null);
        $submission->setFilename($filename);
        $submission->setCreatedAt(new \DateTime());

        $errors = $validator->validate($submission);
        if (count($errors) > 0) {
            $logger->warning('Validation failed for submission', ['errors' => (string)$errors]);
            return $this->json(['error' => 'Validation failed', 'details' => (string)$errors], 400);
        }

        $em->persist($submission);
        $em->flush();

        return $this->json(['ok' => true, 'filename' => '/uploads/'.$filename]);
    }
}
