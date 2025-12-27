import type { ComponentType } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { LoginPage } from '@/pages/LoginPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AdminRolesPage } from '@/pages/AdminRolesPage';
import { DataRequirementPage } from '@/pages/DataRequirementPage';
import { DataTerapisPage } from '@/pages/DataTerapisPage';
import { DetailTerapisPage } from '@/pages/DetailTerapisPage';
import { DataTrainingPage } from '@/pages/DataTrainingPage';
import { TNAPage } from '@/pages/TNAPage';
import { FormTNAPage } from '@/pages/FormTNAPage';
import { EvaluasiPage } from '@/pages/EvaluasiPage';
import { FormEvaluasiPage } from '@/pages/FormEvaluasiPage';
import { SettingPage } from '@/pages/SettingPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  requiresAuth?: boolean;
}

export const routes: Route[] = [
  { path: '/login', Component: LoginPage, title: 'Login', requiresAuth: false },
  { path: '/', Component: IndexPage, title: 'Dashboard', requiresAuth: true },
  { path: '/admin/users', Component: AdminUsersPage, title: 'Kelola User', requiresAuth: true },
  { path: '/admin/roles', Component: AdminRolesPage, title: 'Kelola Role', requiresAuth: true },
  { path: '/data-requirement', Component: DataRequirementPage, title: 'Data Requirement', requiresAuth: true },
  { path: '/data-terapis', Component: DataTerapisPage, title: 'Data Terapis', requiresAuth: true },
  { path: '/detail-terapis/:id', Component: DetailTerapisPage, title: 'Detail Terapis', requiresAuth: true },
  { path: '/data-training', Component: DataTrainingPage, title: 'Data Training', requiresAuth: true },
  { path: '/tna', Component: TNAPage, title: 'Form Analisa Kebutuhan Training', requiresAuth: true },
  { path: '/form-tna', Component: FormTNAPage, title: 'Buat Form TNA', requiresAuth: true },
  { path: '/evaluasi', Component: EvaluasiPage, title: 'Evaluasi Pasca Pelatihan', requiresAuth: true },
  { path: '/form-evaluasi', Component: FormEvaluasiPage, title: 'Buat Form Evaluasi', requiresAuth: true },
  { path: '/setting', Component: SettingPage, title: 'Setting', requiresAuth: true },
];
