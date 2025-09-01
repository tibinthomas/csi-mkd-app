import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

export interface District {
  id: number;
  name: string;
}

export interface Priest {
  id: number;
  name: string;
}

export interface Church {
  id: number;
  name: string;
  districtId: number;
  priestId: number;
}

export interface ChurchData {
  district: District[];
  priests: Priest[];
  churches: Church[];
}

export interface ChurchWithDetails extends Church {
  districtName: string;
  priestName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChurchDataService {
  private readonly http = inject(HttpClient);
  
  readonly churchData$ = this.http.get<ChurchData>('assets/data/church-data.json')
    .pipe(shareReplay(1));

  /**
   * Get location names based on search word
   * @param searchWord - The search term to filter locations
   * @returns Observable array of matching district names
   */
  getLocationsBySearch(searchWord: string): Observable<string[]> {
    return this.churchData$.pipe(
      map(data => {
        if (!searchWord || searchWord.trim() === '') {
          return data.district.map(d => d.name);
        }
        
        const searchTerm = searchWord.toLowerCase().trim();
        return data.district
          .filter(district => 
            district.name.toLowerCase().includes(searchTerm)
          )
          .map(district => district.name);
      })
    );
  }

  /**
   * Get churches with priest names based on selected location and search word
   * @param locationName - The selected location/district name
   * @param searchWord - Optional search term to filter churches
   * @returns Observable array of churches with priest details
   */
  getChurchesByLocationAndSearch(locationName: string, searchWord?: string): Observable<ChurchWithDetails[]> {
    return this.churchData$.pipe(
      map(data => {
        // Find the district by name
        const district = data.district.find(d => 
          d.name.toLowerCase() === locationName.toLowerCase()
        );
        
        if (!district) {
          return [];
        }

        // Get churches in the selected district
        let churches = data.churches.filter(church => 
          church.districtId === district.id
        );

        // Apply search filter if provided
        if (searchWord && searchWord.trim() !== '') {
          const searchTerm = searchWord.toLowerCase().trim();
          churches = churches.filter(church =>
            church.name.toLowerCase().includes(searchTerm)
          );
        }

        // Map to include district and priest details
        return churches.map(church => {
          const priest = data.priests.find(p => p.id === church.priestId);
          return {
            ...church,
            districtName: district.name,
            priestName: priest?.name || 'Unknown Priest'
          };
        });
      })
    );
  }

  /**
   * Get all locations/districts
   * @returns Observable array of all district names
   */
  getAllLocations(): Observable<string[]> {
    return this.churchData$.pipe(
      map(data => data.district.map(d => d.name))
    );
  }

  /**
   * Get all churches with full details
   * @returns Observable array of all churches with district and priest details
   */
  getAllChurchesWithDetails(): Observable<ChurchWithDetails[]> {
    return this.churchData$.pipe(
      map(data => {
        return data.churches.map(church => {
          const district = data.district.find(d => d.id === church.districtId);
          const priest = data.priests.find(p => p.id === church.priestId);
          
          return {
            ...church,
            districtName: district?.name || 'Unknown District',
            priestName: priest?.name || 'Unknown Priest'
          };
        });
      })
    );
  }

  /**
   * Search churches globally by name or priest name
   * @param searchWord - The search term
   * @returns Observable array of matching churches with details
   */
  searchChurches(searchWord: string): Observable<ChurchWithDetails[]> {
    return this.churchData$.pipe(
      map(data => {
        if (!searchWord || searchWord.trim() === '') {
          return [];
        }

        const searchTerm = searchWord.toLowerCase().trim();
        
        const matchingChurches = data.churches.filter(church => {
          const priest = data.priests.find(p => p.id === church.priestId);
          return church.name.toLowerCase().includes(searchTerm) ||
                 (priest?.name.toLowerCase().includes(searchTerm));
        });

        return matchingChurches.map(church => {
          const district = data.district.find(d => d.id === church.districtId);
          const priest = data.priests.find(p => p.id === church.priestId);
          
          return {
            ...church,
            districtName: district?.name || 'Unknown District',
            priestName: priest?.name || 'Unknown Priest'
          };
        });
      })
    );
  }

  /**
   * Get priest details by church ID
   * @param churchId - The church ID
   * @returns Observable priest details or null
   */
  getPriestByChurchId(churchId: number): Observable<Priest | null> {
    return this.churchData$.pipe(
      map(data => {
        const church = data.churches.find(c => c.id === churchId);
        if (!church) return null;
        
        return data.priests.find(p => p.id === church.priestId) || null;
      })
    );
  }

  /**
   * Get church name by church ID (synchronous)
   * @param churchId - The church ID
   * @param churchData - The loaded church data
   * @returns Church name or fallback message
   */
  getChurchNameById(churchId: number | null | undefined, churchData: ChurchData | null): string {
    if (!churchId || !churchData) return 'Unknown Church';
    
    const church = churchData.churches.find(c => c.id === churchId);
    return church?.name || `Church ID: ${churchId}`;
  }

  /**
   * Get church details by ID (synchronous)
   * @param churchId - The church ID  
   * @param churchData - The loaded church data
   * @returns Church with details or null
   */
  getChurchDetailsById(churchId: number | null | undefined, churchData: ChurchData | null): ChurchWithDetails | null {
    if (!churchId || !churchData) return null;
    
    const church = churchData.churches.find(c => c.id === churchId);
    if (!church) return null;
    
    const district = churchData.district.find(d => d.id === church.districtId);
    const priest = churchData.priests.find(p => p.id === church.priestId);
    
    return {
      ...church,
      districtName: district?.name || 'Unknown District',
      priestName: priest?.name || 'Unknown Priest'
    };
  }
}