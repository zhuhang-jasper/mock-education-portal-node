-- Check DATABASE VERISON
SELECT VERSION() ;

/* DATABASE SETUP SCRIPTS */
DROP DATABASE IF EXISTS uep_db;
CREATE DATABASE uep_db CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';

-- Configure timezone
SET GLOBAL time_zone = 'Asia/Singapore';
SET time_zone = "Asia/Singapore";
SELECT @@global.time_zone, @@session.time_zone, CURRENT_TIMESTAMP();
SELECT CURRENT_TIMESTAMP() AS singaporeTime, CONVERT_TZ(CURRENT_TIMESTAMP(),'Asia/Singapore','Europe/Berlin') AS germanyTime;

-- Create new USER for nodejs with full access
CREATE USER 'uep_node'@'localhost' IDENTIFIED WITH mysql_native_password BY '!uep@Uf1N1ty!';
GRANT ALL PRIVILEGES ON uep_db.* TO 'uep_node'@'localhost';
flush privileges;

-- Create Teacher Table
DROP TABLE IF EXISTS uep_db.teacher;
CREATE TABLE uep_db.teacher
(Id INT NOT NULL AUTO_INCREMENT,
Email VARCHAR(45) NOT NULL,
FirstName VARCHAR(45),
LastName VARCHAR(45),
Status VARCHAR(25) NOT NULL DEFAULT 'INACTIVE', -- Proper registered = ACTIVE
CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedDate TIMESTAMP,
CreatedBy VARCHAR(25),
UpdatedBy VARCHAR(25),
PRIMARY KEY (Id)) AUTO_INCREMENT=1 ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE UNIQUE INDEX Index_Teacher_Email ON uep_db.teacher (Email);
CREATE INDEX Index_Teacher_Status ON uep_db.teacher (Status);

-- Create Student Table
DROP TABLE IF EXISTS uep_db.student;
CREATE TABLE uep_db.student
(Id INT NOT NULL AUTO_INCREMENT,
Email VARCHAR(45) NOT NULL,
FirstName VARCHAR(45),
LastName VARCHAR(45),
Status VARCHAR(25) NOT NULL DEFAULT 'INACTIVE', -- Proper registered = ACTIVE
IsSuspended INT NOT NULL DEFAULT 0,
CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedDate TIMESTAMP,
CreatedBy VARCHAR(25),
UpdatedBy VARCHAR(25),
PRIMARY KEY (Id)) AUTO_INCREMENT=1 ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE UNIQUE INDEX Index_Student_Email ON uep_db.student (Email);
CREATE INDEX Index_Student_Status ON uep_db.student (Status);
CREATE INDEX Index_Student_IsSuspended ON uep_db.student (IsSuspended);

-- Create Teacher_Student Table
DROP TABLE IF EXISTS uep_db.teacher_student;
CREATE TABLE uep_db.teacher_student
(TeacherId INT NOT NULL,
StudentId INT NOT NULL,
Status VARCHAR(25) NOT NULL DEFAULT 'ACTIVE', -- Deleted = INACTIVE
CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedDate TIMESTAMP,
CreatedBy VARCHAR(25),
UpdatedBy VARCHAR(25),
PRIMARY KEY (TeacherId, StudentId),
FOREIGN KEY (TeacherId) REFERENCES uep_db.teacher (Id),
FOREIGN KEY (StudentId) REFERENCES uep_db.student (Id)) AUTO_INCREMENT=1 ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX Index_TeacherStudent_Status ON uep_db.teacher_student (Status);
