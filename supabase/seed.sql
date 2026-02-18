-- Shir Gallery MVP - Seed Data
-- Run this AFTER migration.sql in Supabase SQL Editor
--
-- Sample gallery with picsum.photos placeholder images
-- Password: "shir2024" (bcrypt hash below)

INSERT INTO galleries (
  id, slug, client_name, shoot_title, subtitle, location, shoot_date,
  password_hash, cover_image_url, expires_at, zip_url, edited_count, originals_count
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'maya-and-lior',
  'Maya & Lior',
  'Expecting',
  'A golden hour session celebrating the beginning of a new chapter',
  'Tel Aviv, Jaffa Port',
  '2026-01-15',
  '$2b$10$TPYZFbjkGCRHQyM/dwY2eOFnXbIl81xz5tWbzYsZNqt5SLWUz17v6',
  'https://picsum.photos/id/1015/1200/800',
  NOW() + INTERVAL '45 days',
  NULL,
  35,
  100
);

-- Highlight images (8 editorial picks)
INSERT INTO gallery_assets (gallery_id, web_url, full_url, type, sort_order, filename) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1015/800/1200', 'https://picsum.photos/id/1015/2400/3600', 'highlight', 1, 'highlight-01.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1016/800/600',  'https://picsum.photos/id/1016/2400/1800', 'highlight', 2, 'highlight-02.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1018/800/1200', 'https://picsum.photos/id/1018/2400/3600', 'highlight', 3, 'highlight-03.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1019/800/600',  'https://picsum.photos/id/1019/2400/1800', 'highlight', 4, 'highlight-04.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1020/800/1200', 'https://picsum.photos/id/1020/2400/3600', 'highlight', 5, 'highlight-05.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1021/800/600',  'https://picsum.photos/id/1021/2400/1800', 'highlight', 6, 'highlight-06.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1022/800/1200', 'https://picsum.photos/id/1022/2400/3600', 'highlight', 7, 'highlight-07.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1023/800/600',  'https://picsum.photos/id/1023/2400/1800', 'highlight', 8, 'highlight-08.jpg');

-- Gallery images (edited photos, 27 more to total 35)
INSERT INTO gallery_assets (gallery_id, web_url, full_url, type, sort_order, filename) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1024/600/400', 'https://picsum.photos/id/1024/2400/1600', 'gallery', 1,  'gallery-01.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1025/600/400', 'https://picsum.photos/id/1025/2400/1600', 'gallery', 2,  'gallery-02.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1027/600/400', 'https://picsum.photos/id/1027/2400/1600', 'gallery', 3,  'gallery-03.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1029/600/400', 'https://picsum.photos/id/1029/2400/1600', 'gallery', 4,  'gallery-04.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1031/600/400', 'https://picsum.photos/id/1031/2400/1600', 'gallery', 5,  'gallery-05.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1033/600/400', 'https://picsum.photos/id/1033/2400/1600', 'gallery', 6,  'gallery-06.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1035/600/400', 'https://picsum.photos/id/1035/2400/1600', 'gallery', 7,  'gallery-07.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1036/600/400', 'https://picsum.photos/id/1036/2400/1600', 'gallery', 8,  'gallery-08.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1037/600/400', 'https://picsum.photos/id/1037/2400/1600', 'gallery', 9,  'gallery-09.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1038/600/400', 'https://picsum.photos/id/1038/2400/1600', 'gallery', 10, 'gallery-10.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1039/600/400', 'https://picsum.photos/id/1039/2400/1600', 'gallery', 11, 'gallery-11.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1040/600/400', 'https://picsum.photos/id/1040/2400/1600', 'gallery', 12, 'gallery-12.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1041/600/400', 'https://picsum.photos/id/1041/2400/1600', 'gallery', 13, 'gallery-13.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1042/600/400', 'https://picsum.photos/id/1042/2400/1600', 'gallery', 14, 'gallery-14.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1043/600/400', 'https://picsum.photos/id/1043/2400/1600', 'gallery', 15, 'gallery-15.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1044/600/400', 'https://picsum.photos/id/1044/2400/1600', 'gallery', 16, 'gallery-16.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1045/600/400', 'https://picsum.photos/id/1045/2400/1600', 'gallery', 17, 'gallery-17.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1047/600/400', 'https://picsum.photos/id/1047/2400/1600', 'gallery', 18, 'gallery-18.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1048/600/400', 'https://picsum.photos/id/1048/2400/1600', 'gallery', 19, 'gallery-19.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1049/600/400', 'https://picsum.photos/id/1049/2400/1600', 'gallery', 20, 'gallery-20.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1050/600/400', 'https://picsum.photos/id/1050/2400/1600', 'gallery', 21, 'gallery-21.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1051/600/400', 'https://picsum.photos/id/1051/2400/1600', 'gallery', 22, 'gallery-22.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1052/600/400', 'https://picsum.photos/id/1052/2400/1600', 'gallery', 23, 'gallery-23.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1053/600/400', 'https://picsum.photos/id/1053/2400/1600', 'gallery', 24, 'gallery-24.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1054/600/400', 'https://picsum.photos/id/1054/2400/1600', 'gallery', 25, 'gallery-25.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1055/600/400', 'https://picsum.photos/id/1055/2400/1600', 'gallery', 26, 'gallery-26.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1056/600/400', 'https://picsum.photos/id/1056/2400/1600', 'gallery', 27, 'gallery-27.jpg');

-- Original images (20 of 100 for seed, with load-more pagination)
INSERT INTO gallery_assets (gallery_id, web_url, full_url, type, sort_order, filename) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1057/600/400', 'https://picsum.photos/id/1057/2400/1600', 'original', 1,  'DSC_0001.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1058/600/400', 'https://picsum.photos/id/1058/2400/1600', 'original', 2,  'DSC_0002.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1059/600/400', 'https://picsum.photos/id/1059/2400/1600', 'original', 3,  'DSC_0003.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1060/600/400', 'https://picsum.photos/id/1060/2400/1600', 'original', 4,  'DSC_0004.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1062/600/400', 'https://picsum.photos/id/1062/2400/1600', 'original', 5,  'DSC_0005.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1063/600/400', 'https://picsum.photos/id/1063/2400/1600', 'original', 6,  'DSC_0006.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1064/600/400', 'https://picsum.photos/id/1064/2400/1600', 'original', 7,  'DSC_0007.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1065/600/400', 'https://picsum.photos/id/1065/2400/1600', 'original', 8,  'DSC_0008.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1066/600/400', 'https://picsum.photos/id/1066/2400/1600', 'original', 9,  'DSC_0009.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1067/600/400', 'https://picsum.photos/id/1067/2400/1600', 'original', 10, 'DSC_0010.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1068/600/400', 'https://picsum.photos/id/1068/2400/1600', 'original', 11, 'DSC_0011.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1069/600/400', 'https://picsum.photos/id/1069/2400/1600', 'original', 12, 'DSC_0012.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1070/600/400', 'https://picsum.photos/id/1070/2400/1600', 'original', 13, 'DSC_0013.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1071/600/400', 'https://picsum.photos/id/1071/2400/1600', 'original', 14, 'DSC_0014.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1072/600/400', 'https://picsum.photos/id/1072/2400/1600', 'original', 15, 'DSC_0015.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1073/600/400', 'https://picsum.photos/id/1073/2400/1600', 'original', 16, 'DSC_0016.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1074/600/400', 'https://picsum.photos/id/1074/2400/1600', 'original', 17, 'DSC_0017.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1075/600/400', 'https://picsum.photos/id/1075/2400/1600', 'original', 18, 'DSC_0018.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1076/600/400', 'https://picsum.photos/id/1076/2400/1600', 'original', 19, 'DSC_0019.jpg'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://picsum.photos/id/1077/600/400', 'https://picsum.photos/id/1077/2400/1600', 'original', 20, 'DSC_0020.jpg');
