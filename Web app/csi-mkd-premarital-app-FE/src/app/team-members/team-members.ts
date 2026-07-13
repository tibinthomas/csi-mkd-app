import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive';
import { AdBanner } from '../shared/ad-banner/ad-banner';

@Component({
  selector: 'app-team-members',
  imports: [MatCardModule, AnimateOnScrollDirective, AdBanner],
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
      qualification: 'B.A., M.A., B.Th., B.D., M.Th., C.P.E.',
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
    {
      name: 'Dr. Benjamin George',
      qualification: 'M.S. ORTHO., Former DMO Kottayam',
    },
    {
      name: 'Mrs. Lincy T Varghese',
      qualification:
        'M.S.W., M.Sc. Psy., M.Sc. Couns. & Psychotherapy, N.L.P. Master Trainer, Hypnotherapist',
    },
    {
      name: 'Adv. Sheeba Tharakan',
      qualification: 'B.Com., L.L.B.(Registrar CSI MKD)',
    },
    { name: 'Dr. Anitha Eapen', qualification: 'M.B.B.S., D.G.O.' },
    {
      name: 'Mrs. Sofiya Susan Paul',
      qualification: 'B.Sc. M.Sc. (Couns Psy.)',
    },
    {
      name: 'Mrs. Aleyamma T.V',
      qualification: 'M.A., B.Ed., D.C.P.C., P.G.D.C.A.',
    },
    { name: 'Mrs. Susamma P.I', qualification: 'B.Sc.,B.Ed.,P.G.D.C.P.C' },
    { name: 'Mr. Sachin Sunny', qualification: 'B.Tech (Office Staff)' },
  ]);

  private static readonly HONORIFICS = new Set([
    'rev', 'dr', 'mr', 'mrs', 'ms', 'adv', 'prof', 'fr', 'sr', 'pastor',
  ]);

  /** Monogram from the first and last significant words, skipping honorifics
   *  ("Rev. Dr. Vergis K Cheriyan" → "VC"). */
  protected initialsFor(name: string): string {
    const words = name
      .split(/\s+/)
      .filter((w) => !TeamMembers.HONORIFICS.has(w.replace(/\./g, '').toLowerCase()));
    if (words.length === 0) {
      return name.charAt(0).toUpperCase();
    }
    const first = words[0].charAt(0);
    const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }
}
