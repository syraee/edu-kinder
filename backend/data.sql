--
-- PostgreSQL database dump
--

\restrict kGzuxus3ONHF565rCPiWml3hg4XhB2f7PSc6BpOeteSHhn4kyzGyw87LAbkZP7w

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: admin
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Role" DISABLE TRIGGER ALL;

INSERT INTO public."Role" (id, type) VALUES (1, 'Admin');
INSERT INTO public."Role" (id, type) VALUES (2, 'Teacher');
INSERT INTO public."Role" (id, type) VALUES (3, 'Parent');


ALTER TABLE public."Role" ENABLE TRIGGER ALL;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."User" DISABLE TRIGGER ALL;

INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (1, 'admin', 'admin2', 1, 'a9edukinder@gmail.com', true, false, NULL, '2025-12-01 20:58:46.239');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (2, 'Anna', 'Kovačová', 3, 'anna@example.com', true, false, NULL, '2025-12-01 20:58:46.25');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (3, 'Magdaléna', 'Juhásová', 3, 'magdalena.juhasova@example.com', true, false, NULL, '2025-12-01 20:58:46.255');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (4, 'Patrik', 'Borský', 3, 'patrik.borsky@example.com', true, false, NULL, '2025-12-01 20:58:46.26');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (5, 'Samuel', 'Antal', 3, 'samuel.antal@example.com', true, false, NULL, '2025-12-01 20:58:46.265');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (6, 'Izabela', 'Antalová', 3, 'lizzsyrae11@gmail.com', false, false, NULL, '2025-12-01 20:58:46.269');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (7, 'Mgr. Eliška', 'Učenlivá', 2, 'eliska.ucenliva@example.com', true, false, NULL, '2025-12-01 20:58:46.276');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (8, 'Mgr. Frederika', 'Zavadská', 2, 'frederika.zavadska@example.com', true, false, NULL, '2025-12-01 20:58:46.281');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (10, NULL, NULL, 3, 'ninka.chomova@gmail.com', false, true, NULL, '2025-12-01 21:34:34.218');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (11, 'Peter', 'Podolny', 3, 'primechomova@gmail.com', false, false, '+421999999999', '2025-12-01 21:36:02.823');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (9, 'Adam', 'Langos', 3, 'mackoadam60@gmail.cos', true, true, '+421999999999', '2025-12-01 21:26:53.108');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (12, 'Laco', 'Oco', 3, 'mackoadam60@gmail.co', true, true, '+421999999999', '2025-12-02 21:25:42.654');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (14, NULL, NULL, 3, 'rezen@gmail.pol', false, true, NULL, '2025-12-03 09:34:36.053');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (15, NULL, NULL, 3, 'masmfds@jk.sk', false, true, NULL, '2025-12-03 09:36:22.678');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (16, NULL, NULL, 3, 'manne@pobox.op', false, false, NULL, '2025-12-03 09:40:25.753');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (13, NULL, NULL, 3, 'mackoadam60@gmail.cop', false, true, NULL, '2025-12-03 09:33:28.537');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (18, NULL, NULL, 3, 'Edi@example.sk', false, true, NULL, '2025-12-08 14:34:17.997');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (19, NULL, NULL, 3, 'adrejkovelky@example.sk', false, true, NULL, '2025-12-08 14:46:06.204');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (20, NULL, NULL, 3, 'rezen@ryza.sk', false, false, NULL, '2025-12-08 14:46:07.575');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (21, NULL, NULL, 3, 'macko@example.sk', false, false, NULL, '2026-01-14 13:40:11.354');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (22, 'Laco', 'Strike', 2, 'laco@example.pl', false, false, '+487359256487', '2026-01-16 16:04:28.688');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (17, NULL, NULL, 3, 'mackoadam60@gmail.', false, true, NULL, '2025-12-03 13:10:01.017');
INSERT INTO public."User" (id, "firstName", "lastName", "roleId", email, active, internal, phone, "createdAt") VALUES (23, 'Adam', 'Macko', 3, 'mackoadam60@gmail.com', true, false, '+421905478658', '2026-01-16 16:49:55.573');


ALTER TABLE public."User" ENABLE TRIGGER ALL;

--
-- Data for Name: GroupClass; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."GroupClass" DISABLE TRIGGER ALL;

INSERT INTO public."GroupClass" (id, name, class, "classYear", "classTeacherId", "roomName") VALUES (2, 'lienky', 'B', '2024-09-01 00:00:00', 8, '102');
INSERT INTO public."GroupClass" (id, name, class, "classYear", "classTeacherId", "roomName") VALUES (3, 'motýliky', 'C', '2024-09-01 00:00:00', NULL, '103');
INSERT INTO public."GroupClass" (id, name, class, "classYear", "classTeacherId", "roomName") VALUES (1, 'včielky', 'A', '2024-09-01 00:00:00', 1, '101');


ALTER TABLE public."GroupClass" ENABLE TRIGGER ALL;

--
-- Data for Name: Child; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."Child" DISABLE TRIGGER ALL;

INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (1, 'Peter', 'Novak', '2023-09-01 00:00:00', 1, NULL, '2025-12-01 20:58:46.306');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (2, 'Eva', 'Kovačová', '2023-09-01 00:00:00', 1, NULL, '2025-12-01 20:58:46.313');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (3, 'Eugen', 'Juhás', '2023-09-01 00:00:00', 1, NULL, '2025-12-01 20:58:46.317');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (4, 'Anna', 'Borská', '2023-09-01 00:00:00', 2, NULL, '2025-12-01 20:58:46.321');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (5, 'Kristína', 'Antalová', '2023-09-01 00:00:00', 3, NULL, '2025-12-01 20:58:46.329');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (6, 'Svätopluk', 'Antal', '2023-09-01 00:00:00', 3, NULL, '2025-12-01 20:58:46.334');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (7, 'Alena', 'Hudáková', '2025-12-01 21:12:16.861', 2, '2023-06-27 00:00:00', '2025-12-01 21:12:16.862');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (8, 'Janko', 'Hraško', '2025-12-01 21:18:59.757', 2, '2023-06-01 00:00:00', '2025-12-01 21:18:59.758');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (9, 'Janko', 'Hraško', '2025-12-01 21:19:44.742', 2, '2023-06-01 00:00:00', '2025-12-01 21:19:44.743');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (10, 'Peter', 'Langos', '2025-12-01 21:26:53.089', 2, '2024-02-26 00:00:00', '2025-12-01 21:26:53.09');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (12, 'Langos', 'Langos', '2025-12-01 21:30:38.661', 2, '2024-07-01 00:00:00', '2025-12-01 21:30:38.663');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (13, 'Kolovratok', 'Berta', '2025-12-01 21:34:34.174', 2, '2024-02-01 00:00:00', '2025-12-01 21:34:34.175');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (14, 'Laco', 'Kras', '2025-12-02 21:25:42.611', 2, '2025-12-18 00:00:00', '2025-12-02 21:25:42.613');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (15, 'Peter', 'Klokan', '2025-12-03 09:33:28.338', 3, '2025-11-07 00:00:00', '2025-12-03 09:33:28.343');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (16, 'Adam', 'Kotlar', '2025-12-03 09:34:36.029', 1, '2025-11-14 00:00:00', '2025-12-03 09:34:36.033');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (17, 'dsadafd', 'fdafds', '2025-12-03 09:36:22.658', 1, '2025-12-06 00:00:00', '2025-12-03 09:36:22.66');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (18, 'Indigo', 'Manne', '2025-12-03 09:40:25.716', 3, '2025-10-22 00:00:00', '2025-12-03 09:40:25.727');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (19, 'asdsadf', 'fdfadas', '2025-12-03 13:09:47.921', 3, '2025-10-16 00:00:00', '2025-12-03 13:09:47.924');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (20, 'asdsadf', 'fdfadas', '2025-12-03 13:10:01.003', 3, '2025-10-16 00:00:00', '2025-12-03 13:10:01.005');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (21, 'Andrea', 'Ediova', '2025-12-08 14:34:17.844', 2, '2024-06-08 00:00:00', '2025-12-08 14:34:17.847');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (22, 'Laco', 'Cisty', '2025-12-08 14:37:21.281', 2, '2022-02-08 00:00:00', '2025-12-08 14:37:21.283');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (23, 'Laco', 'Cisty', '2025-12-08 14:39:37.736', 2, '2022-02-08 00:00:00', '2025-12-08 14:39:37.738');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (24, 'Laco', 'Cisty', '2025-12-08 14:43:50.31', 2, '2022-02-08 00:00:00', '2025-12-08 14:43:50.311');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (25, 'Andrejko', 'Hrasko', '2025-12-08 14:46:06.189', 2, '2023-02-08 00:00:00', '2025-12-08 14:46:06.191');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (26, 'Riso', 'Klokan', '2025-12-08 14:46:07.556', 2, '2022-02-08 00:00:00', '2025-12-08 14:46:07.558');
INSERT INTO public."Child" (id, "firstName", "lastName", "startDate", "groupId", birthday, "createdAt") VALUES (27, 'laco', 'kral', '2026-01-14 13:40:11.228', 2, '2026-01-15 00:00:00', '2026-01-14 13:40:11.23');


ALTER TABLE public."Child" ENABLE TRIGGER ALL;

--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."Attendance" DISABLE TRIGGER ALL;

INSERT INTO public."Attendance" (id, "childId", date, state, "createdAt", "updatedAt") VALUES (1, 1, '2026-01-14 23:00:00', 2, '2026-01-15 20:45:00.467', '2026-01-15 20:45:00.467');


ALTER TABLE public."Attendance" ENABLE TRIGGER ALL;

--
-- Data for Name: AttendanceLog; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."AttendanceLog" DISABLE TRIGGER ALL;

INSERT INTO public."AttendanceLog" (id, "childId", date, "from", "to", "userId", "userEmail", "createdAt") VALUES (1, 1, '2026-01-14 23:00:00', 1, 2, 1, 'a9edukinder@gmail.com', '2026-01-15 20:45:00.49');


ALTER TABLE public."AttendanceLog" ENABLE TRIGGER ALL;

--
-- Data for Name: ChangeLog; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."ChangeLog" DISABLE TRIGGER ALL;



ALTER TABLE public."ChangeLog" ENABLE TRIGGER ALL;

--
-- Data for Name: ChildGuardian; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."ChildGuardian" DISABLE TRIGGER ALL;

INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (1, 2, 'mother', 2);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (2, 3, 'mother', 3);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (3, 4, 'father', 4);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (4, 5, 'father', 5);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (5, 5, 'father', 6);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (6, 6, 'mother', 5);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (7, 6, 'mother', 6);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (8, 9, 'parent', 10);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (9, 10, 'parent', 13);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (10, 11, 'parent', 1);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (11, 12, 'parent', 14);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (12, 13, 'parent', 15);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (13, 14, 'parent', 16);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (14, 15, 'parent', 17);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (15, 16, 'parent', 18);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (16, 17, 'parent', 20);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (17, 18, 'parent', 21);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (18, 19, 'parent', 25);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (19, 20, 'parent', 26);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (20, 21, 'parent', 27);
INSERT INTO public."ChildGuardian" (id, "userId", relationship, "childId") VALUES (21, 23, 'parent', 3);


ALTER TABLE public."ChildGuardian" ENABLE TRIGGER ALL;

--
-- Data for Name: LoginToken; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."LoginToken" DISABLE TRIGGER ALL;



ALTER TABLE public."LoginToken" ENABLE TRIGGER ALL;

--
-- Data for Name: MealAttendance; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."MealAttendance" DISABLE TRIGGER ALL;



ALTER TABLE public."MealAttendance" ENABLE TRIGGER ALL;

--
-- Data for Name: PaymentSettings; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."PaymentSettings" DISABLE TRIGGER ALL;

INSERT INTO public."PaymentSettings" (id, "breakfastFee", "lunchFee", "snackFee", "tuitionFee", "tuitionFeeExt", "mealsIban", "tuitionIban", "mealsVarSym", "tuitionVarSym", "validFrom", "validTo", "createdAt") VALUES (1, 2.30, 1.30, 5.30, 5.30, 0.10, 'DE89 3704 0044 0532 0130 00', 'DE89 3704 0044 0532 0130 00', '123', '1235', '2026-01-15 20:13:26.958', NULL, '2026-01-15 20:13:26.958');


ALTER TABLE public."PaymentSettings" ENABLE TRIGGER ALL;

--
-- Data for Name: MealMonthlyStatement; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."MealMonthlyStatement" DISABLE TRIGGER ALL;



ALTER TABLE public."MealMonthlyStatement" ENABLE TRIGGER ALL;

--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."Message" DISABLE TRIGGER ALL;

INSERT INTO public."Message" (id, "senderId", "recipientId", value, "createdAt", notified, "readAt", "isAttachment", "attachmentName", "attachmentMime", "attachmentSize") VALUES (1, 1, 5, 'Ahoj', '2026-01-15 19:46:55.167', true, NULL, false, NULL, NULL, NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", value, "createdAt", notified, "readAt", "isAttachment", "attachmentName", "attachmentMime", "attachmentSize") VALUES (2, 1, 5, 'dze si', '2026-01-15 19:47:06.913', true, NULL, false, NULL, NULL, NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", value, "createdAt", notified, "readAt", "isAttachment", "attachmentName", "attachmentMime", "attachmentSize") VALUES (3, 1, 5, 'poc vypic', '2026-01-15 20:23:15.017', true, NULL, false, NULL, NULL, NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", value, "createdAt", notified, "readAt", "isAttachment", "attachmentName", "attachmentMime", "attachmentSize") VALUES (4, 1, 5, 'uploads/1768508691029_poster template UPJ_ 2026.png', '2026-01-15 20:24:51.035', true, NULL, true, 'poster template UPJÅ  2026.png', 'image/png', 84647);


ALTER TABLE public."Message" ENABLE TRIGGER ALL;

--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."Payment" DISABLE TRIGGER ALL;

INSERT INTO public."Payment" (id, "childId", amount, "feeType", "paidAt") VALUES (1, 6, 0.810000000000000100000000000000, 'STRAVA', '2026-01-15 00:00:00');


ALTER TABLE public."Payment" ENABLE TRIGGER ALL;

--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public."Session" DISABLE TRIGGER ALL;



ALTER TABLE public."Session" ENABLE TRIGGER ALL;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

ALTER TABLE public._prisma_migrations DISABLE TRIGGER ALL;

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('02a754eb-232d-4c82-8c2c-13978dff9927', '63648f7b95b07d08e17e2a62b2fa7df697d251d73565c440b6f332ee49e3d6eb', '2025-12-01 20:49:59.67456+00', '20251112174434_init', NULL, NULL, '2025-12-01 20:49:59.42959+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('0a352e65-6ce5-4784-ac33-c137de71ab8c', '9b8241a44d23edefba80a2b74fad47784d063d9e8538d20f4cc2e07663e8efc6', '2025-12-01 20:51:43.580689+00', '20251201205143_internal', NULL, NULL, '2025-12-01 20:51:43.51324+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('55e8be0b-7d94-421e-9b14-98838571cc7a', '6714b6e6426fc870f13ed39eebf49462116594d1cd8dc18cf0f3c6c16c01a709', '2026-01-15 19:34:34.192113+00', '20260115193433_zmeny', NULL, NULL, '2026-01-15 19:34:33.863409+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('658f0fae-0754-41ec-a5c5-28dfb30263d2', '69c4bababe1769ff6e5538a13870810c19a54cfdfb1337843405002949abd8e4', '2026-01-15 20:40:45.796211+00', '20260115204045_dalsie', NULL, NULL, '2026-01-15 20:40:45.612946+00', 1);


ALTER TABLE public._prisma_migrations ENABLE TRIGGER ALL;

--
-- Name: AttendanceLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."AttendanceLog_id_seq"', 1, true);


--
-- Name: Attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Attendance_id_seq"', 1, true);


--
-- Name: ChangeLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."ChangeLog_id_seq"', 1, false);


--
-- Name: ChildGuardian_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."ChildGuardian_id_seq"', 21, true);


--
-- Name: Child_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Child_id_seq"', 27, true);


--
-- Name: GroupClass_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."GroupClass_id_seq"', 3, true);


--
-- Name: LoginToken_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."LoginToken_id_seq"', 1, false);


--
-- Name: MealAttendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."MealAttendance_id_seq"', 1, false);


--
-- Name: MealMonthlyStatement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."MealMonthlyStatement_id_seq"', 1, false);


--
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Message_id_seq"', 4, true);


--
-- Name: PaymentSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."PaymentSettings_id_seq"', 1, true);


--
-- Name: Payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Payment_id_seq"', 1, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Role_id_seq"', 3, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."User_id_seq"', 23, true);


--
-- PostgreSQL database dump complete
--

\unrestrict kGzuxus3ONHF565rCPiWml3hg4XhB2f7PSc6BpOeteSHhn4kyzGyw87LAbkZP7w

