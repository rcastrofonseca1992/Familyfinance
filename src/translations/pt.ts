import { commonPt } from './common/pt';
import { authPt } from './auth/pt';
import { dashboardPt } from './dashboard/pt';
import { personalPt } from './personal/pt';
import { goalsPt } from './goals/pt';
import { settingsPt } from './settings/pt';
import { forecastPt } from './forecast/pt';
import { firePt } from './fire/pt';

export const pt = {
  ...commonPt,
  ...authPt,
  ...dashboardPt,
  ...personalPt,
  ...goalsPt,
  ...settingsPt,
  ...forecastPt,
  ...firePt,
};