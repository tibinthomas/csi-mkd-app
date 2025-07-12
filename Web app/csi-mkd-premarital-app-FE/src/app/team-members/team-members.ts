import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-team-members',
  imports: [MatCardModule, AnimateOnScrollDirective],
  templateUrl: './team-members.html',
  styleUrl: './team-members.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMembers {
  protected readonly teamMembers = signal([
    {
      name: 'Rev. Robin Mathew John',
      qualification: 'BA Psy., MSc Psy., B.D. (Director)',
    },
    {
      name: 'Rev. Dr. Vergis K Cheriyan',
      qualification: 'D.H.M., B.D., D.C.P.C.',
    },
    { name: 'Rev. Abraham C Prakash', qualification: 'M.A. (couns.), B.D.' },
    {
      name: 'Rev. Jacob Johnson',
      qualification: 'B.A., B.Sc., M.Sc., B.Th., B.D., M.Th.',
    },
    {
      name: 'Rev. Mathew Jillow Ninan',
      qualification: 'B.Com., B.D., M.Sc. (C.P.)',
    },
    {
      name: 'Rev. Praveen George Chacko',
      qualification: 'B.Sc., B.D., D.C.P.C.',
    },
    {
      name: 'Rev. Deebu Abey John',
      qualification: 'B.Sc. Psy., M.Sc. Psy., B.D.',
    },
    { name: 'Rev. Alvin M. Sam', qualification: 'M.Sc. Couns Psy., B.D.' },
    { name: 'Dr. Benjamin George', qualification: 'M.S. ORTHO., D. ORTHO.' },
    {
      name: 'Mrs. Lincy Joseph',
      qualification:
        'M.S.W., M.Sc. Psy., M.Sc. Couns. & Psychotherapy, N.L.P. Trainer',
    },
    { name: 'Adv. Sheeba Tharakan', qualification: 'B.Com., L.L.B.' },
    { name: 'Dr. Anitha Eapen', qualification: 'M.B.B.S., D.G.O.' },
    { name: 'Mrs. Sofiya Susan Paul', qualification: 'B.Sc. M.Sc. (CP)' },
    { name: 'Mrs. Aleyamma V. T', qualification: 'M.A., B.Ed., P.G.D.C.A.' },
    { name: 'Mrs. Susamma P I', qualification: 'B.Sc.,B.Ed.,P.G.D.C.P.C' },
    { name: 'Mr. Joji Laji George', qualification: 'B.Sc. (Office Staff)' },
  ]);
}
