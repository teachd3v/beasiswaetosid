import { ETOSER_PROFILES } from '../data/etoserData';
import type { EtoserProfile } from '../data/etoserData';
import { SHOWCASE_MEDIA_ITEMS } from '../data/mediaItems';
import type { ShowcaseMediaItem } from '../data/mediaItems';
import {
  CORE_PROGRAM_TEAM,
  DEPARTMENT_HEAD,
  REGIONAL_FACILITATORS,
} from '../data/teamData';
import type { CampusFacilitatorGroup, TeamMember } from '../data/teamData';
import { ALUMNI_TESTIMONIALS } from '../data/testimonialsData';
import type { AlumniTestimonial } from '../data/testimonialsData';

export interface PublicTeamPayload {
  readonly departmentHead: TeamMember | null;
  readonly coreProgramTeam: readonly TeamMember[];
  readonly regionalFacilitators: readonly CampusFacilitatorGroup[];
}

async function fetchPublicJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(path, {
      signal,
      headers: { Accept: 'application/json' },
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchShowcaseMedia(
  signal?: AbortSignal,
): Promise<readonly ShowcaseMediaItem[]> {
  const data = await fetchPublicJson<ShowcaseMediaItem[]>('/api/public/media', signal);
  if (Array.isArray(data) && data.length > 0) {
    return data;
  }
  return SHOWCASE_MEDIA_ITEMS;
}

export async function fetchEtoserProfiles(
  signal?: AbortSignal,
): Promise<readonly EtoserProfile[]> {
  const data = await fetchPublicJson<EtoserProfile[]>('/api/public/etosers', signal);
  if (Array.isArray(data) && data.length > 0) {
    return data;
  }
  return ETOSER_PROFILES;
}

export async function fetchTestimonials(
  signal?: AbortSignal,
): Promise<readonly AlumniTestimonial[]> {
  const data = await fetchPublicJson<AlumniTestimonial[]>('/api/public/testimonials', signal);
  if (Array.isArray(data) && data.length > 0) {
    return data;
  }
  return ALUMNI_TESTIMONIALS;
}

export async function fetchTeamData(signal?: AbortSignal): Promise<PublicTeamPayload> {
  const data = await fetchPublicJson<PublicTeamPayload>('/api/public/team', signal);
  if (data && (data.departmentHead || data.coreProgramTeam.length > 0 || data.regionalFacilitators.length > 0)) {
    return data;
  }
  return {
    departmentHead: DEPARTMENT_HEAD,
    coreProgramTeam: CORE_PROGRAM_TEAM,
    regionalFacilitators: REGIONAL_FACILITATORS,
  };
}
