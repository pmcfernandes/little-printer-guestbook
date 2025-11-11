<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251111CreateSubmissions extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create submissions table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            social_link VARCHAR(255) DEFAULT NULL,
            filename VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT NULL
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE submissions');
    }
}
