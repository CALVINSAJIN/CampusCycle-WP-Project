-- All seed users have the password: password123
INSERT INTO users (name,email,password,phone,department) VALUES
('Calvin Sajin','calvin@rajagiri.edu.in',crypt('password123',gen_salt('bf')),'9876543210','CSE'),
('Anjali Menon','anjali@rajagiri.edu.in',crypt('password123',gen_salt('bf')),'9876500001','ECE'),
('Rahul Nair','rahul@rajagiri.edu.in',crypt('password123',gen_salt('bf')),'9876500002','EEE'),
('Sneha Thomas','sneha@rajagiri.edu.in',crypt('password123',gen_salt('bf')),'9876500003','Mechanical'),
('Arjun Varma','arjun@rajagiri.edu.in',crypt('password123',gen_salt('bf')),'9876500004','CSE');

INSERT INTO listings (user_id,title,description,category,condition,image_url,location,status) VALUES
(1,'Scientific Calculator','Casio fx-991EX, used during first year.','Electronics','GOOD','https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600','RSET Campus','AVAILABLE'),
(1,'Arduino Uno Kit','Uno board, USB cable and jumper wires.','Electronics','LIKE_NEW','https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600','Electronics Lab','RESERVED'),
(2,'Engineering Mathematics Textbook','B.S. Grewal, a few pencil notes.','Books','GOOD','https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600','Library Block','AVAILABLE'),
(2,'C Programming Book','Let Us C by Yashavant Kanetkar.','Books','FAIR','https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600','Library Block','COMPLETED'),
(3,'Laptop Stand','Foldable aluminium stand, height adjustable.','Others','LIKE_NEW','https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600','Hostel A','AVAILABLE'),
(3,'Breadboard Set','830-point breadboard with jumper kit.','Lab Equipment','GOOD','https://images.unsplash.com/photo-1518770660439-4636190af475?w=600','Electronics Lab','AVAILABLE'),
(4,'Physics Lab Kit','Vernier calliper, screw gauge and record.','Lab Equipment','GOOD','https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600','Physics Lab','AVAILABLE'),
(4,'Stationery Kit','Drafter, set squares, pens, geometry box.','Stationery','GOOD','https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600','Main Block','AVAILABLE'),
(5,'Previous Year Question Papers','Printed S1-S4 question paper bundle.','Academic Materials','GOOD','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600','Main Block','AVAILABLE'),
(5,'Data Structures Textbook','Second edition, clean copy.','Books','LIKE_NEW','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600','Library Block','AVAILABLE');

INSERT INTO requests (listing_id,requester_id,owner_id,message,status) VALUES
(1,2,1,'I need this calculator for my semester exams.','PENDING'),
(2,3,1,'I need an Arduino for my mini project.','ACCEPTED'),
(3,1,2,'Can I pick up the maths book tomorrow?','PENDING'),
(4,5,2,'This book would help me with C practice.','ACCEPTED'),
(6,4,3,'I need a breadboard for the lab.','REJECTED');
