import type { ComponentType } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
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
}

export const routes: Route[] = [
  { path: '/', Component: IndexPage, title: 'Dashboard' },
  { path: '/data-terapis', Component: DataTerapisPage, title: 'Data Terapis' },
  { path: '/detail-terapis', Component: DetailTerapisPage, title: 'Detail Terapis' },
  { path: '/data-training', Component: DataTrainingPage, title: 'Data Training' },
  { path: '/tna', Component: TNAPage, title: 'Form Analisa Kebutuhan Training' },
  { path: '/form-tna', Component: FormTNAPage, title: 'Buat Form TNA' },
  { path: '/evaluasi', Component: EvaluasiPage, title: 'Evaluasi Pasca Pelatihan' },
  { path: '/form-evaluasi', Component: FormEvaluasiPage, title: 'Buat Form Evaluasi' },
  { path: '/setting', Component: SettingPage, title: 'Setting' },
];
