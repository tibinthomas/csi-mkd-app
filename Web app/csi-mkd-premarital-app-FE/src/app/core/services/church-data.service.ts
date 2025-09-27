import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

export interface Location {
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
  locationId: number;
  priestId: number;
}

export interface ChurchData {
  locations: Location[];
  priests: Priest[];
  churches: Church[];
}

export interface ChurchWithDetails extends Church {
  locationName: string;
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
   * @returns Observable array of matching location names
   */
  getLocationsBySearch(searchWord: string): Observable<string[]> {
    return this.churchData$.pipe(
      map(data => {
        if (!searchWord || searchWord.trim() === '') {
          return data.locations.map(l => l.name);
        }
        
        const searchTerm = searchWord.toLowerCase().trim();
        return data.locations
          .filter(location => 
            location.name.toLowerCase().includes(searchTerm)
          )
          .map(location => location.name);
      })
    );
  }

  /**
   * Get churches with priest names based on selected location and search word
   * @param locationName - The selected location name
   * @param searchWord - Optional search term to filter churches
   * @returns Observable array of churches with priest details
   */
  getChurchesByLocationAndSearch(locationName: string, searchWord?: string): Observable<ChurchWithDetails[]> {
    return this.churchData$.pipe(
      map(data => {
        // Find the location by name
        const location = data.locations.find(l => 
          l.name.toLowerCase() === locationName.toLowerCase()
        );
        
        if (!location) {
          return [];
        }

        // Get churches in the selected location
        let churches = data.churches.filter(church => 
          church.locationId === location.id
        );

        // Apply search filter if provided
        if (searchWord && searchWord.trim() !== '') {
          const searchTerm = searchWord.toLowerCase().trim();
          churches = churches.filter(church =>
            church.name.toLowerCase().includes(searchTerm)
          );
        }

        // Map to include location and priest details
        return churches.map(church => {
          const priest = data.priests.find(p => p.id === church.priestId);
          return {
            ...church,
            locationName: location.name,
            priestName: priest?.name || 'Unknown Priest'
          };
        });
      })
    );
  }

  /**
   * Get all locations
   * @returns Observable array of all location names
   */
  getAllLocations(): Observable<string[]> {
    return this.churchData$.pipe(
      map(data => data.locations.map(l => l.name))
    );
  }

  /**
   * Get all churches with full details
   * @returns Observable array of all churches with location and priest details
   */
  getAllChurchesWithDetails(): Observable<ChurchWithDetails[]> {
    return this.churchData$.pipe(
      map(data => {
        return data.churches.map(church => {
          const location = data.locations.find(l => l.id === church.locationId);
          const priest = data.priests.find(p => p.id === church.priestId);
          
          return {
            ...church,
            locationName: location?.name || 'Unknown Location',
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
          const location = data.locations.find(l => l.id === church.locationId);
          const priest = data.priests.find(p => p.id === church.priestId);
          
          return {
            ...church,
            locationName: location?.name || 'Unknown Location',
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
  getChurchNameById(churchId: number | null | undefined, churchData: ChurchData | null): any {
    if (!churchId || !churchData) return null;
    
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
    
    const location = churchData.locations.find(l => l.id === church.locationId);
    const priest = churchData.priests.find(p => p.id === church.priestId);
    
    return {
      ...church,
      locationName: location?.name || 'Unknown Location',
      priestName: priest?.name || 'Unknown Priest'
    };
  }
}