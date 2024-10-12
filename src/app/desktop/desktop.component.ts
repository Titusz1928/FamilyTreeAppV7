import { Component, inject, OnInit } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { Person } from '../Person';
import { Info } from '../Info';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'ftapp-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements OnInit {
  parentId = 1; // Change this to the ID you want to fetch
  jsonData: any; // JSON structure to hold transformed data
  private firestore: Firestore = inject(Firestore);

  tiletext:string="Inverted";

  tiles: Tile[] = [];

  ngOnInit(): void {

    //first we load all available tables:
    this.fetchAvailableCollections().subscribe((collections) => {
      this.tiles = collections.map((collectionName, index) => ({
        text: collectionName,  // Set the collection name as the tile text
        cols: 2,               // You can customize the size of the tile
        rows: 1,               // Adjust rows per your UI
        color: this.getRandomColor(), // Assign a random color or logic for color
      }));
      console.log(this.tiles);
    });


    // Fetch the parent data with children recursively
    this.fetchPersonWithChildren(this.parentId,'Inverted').subscribe((parentData) => {
      this.jsonData = parentData;
      console.log('Final JSON Data:', JSON.stringify(this.jsonData, null, 2));
    });
  }

// Recursive function to fetch a person and their children
fetchPersonWithChildren(personId: number, collectionName: string, isRoot: boolean = true): Observable<any> {
  const personDocRef = doc(this.firestore, `${collectionName}/${personId}`);
  
  // We only fetch the info document if it's the root call
  const infoDocRef = isRoot ? doc(this.firestore, `${collectionName}/information`) : null;

  return new Observable((observer) => {
    // Function to fetch person data (no need to fetch `info` repeatedly)
    const fetchPersonData = (): Observable<any> => {
      return new Observable((personObserver) => {
        getDoc(personDocRef).then((personSnapshot) => {
          if (personSnapshot.exists()) {
            const personData: Person = personSnapshot.data() as Person;

            // If there are no children, return the person with an empty children array
            if (!personData.children || personData.children.length === 0) {
              personObserver.next({
                data: personData,
                children: []
              });
              personObserver.complete();
            } else {
              // Fetch children recursively
              const childrenFetches = personData.children.map((childId) =>
                this.fetchPersonWithChildren(childId, collectionName, false).pipe(
                  catchError((error) => {
                    console.error(`Error fetching child ${childId}:`, error);
                    return of(null); // Return null in case of error
                  })
                )
              );

              // Wait for all children to be fetched
              forkJoin(childrenFetches).subscribe((children) => {
                const validChildren = children.filter((child) => child !== null);

                // Construct the final JSON structure with the children included
                personObserver.next({
                  data: { ...personData, children: undefined },
                  children: validChildren
                });
                personObserver.complete();
              });
            }
          } else {
            console.error(`No such document for person ID: ${personId}`);
            personObserver.next(null); // Return null if person does not exist
            personObserver.complete();
          }
        }).catch((error) => {
          console.error(`Error fetching person ${personId}:`, error);
          personObserver.next(null);
          personObserver.complete();
        });
      });
    };

    // If this is the root call, fetch the info document
    if (isRoot) {
      getDoc(infoDocRef!).then((infoSnapshot) => {
        if (!infoSnapshot.exists()) {
          console.error(`No such document for collection info in: ${collectionName}`);
          observer.next(null); // Return null if info does not exist
          observer.complete();
          return;
        }

        const infoData: Info = infoSnapshot.data() as Info;

        // Fetch the person data and combine it with the info (only at the root)
        fetchPersonData().subscribe((result: any) => {
          observer.next({
            info: infoData, // Add the collection info here at the root level
            ...result
          });
          observer.complete();
        });

      }).catch((error) => {
        console.error(`Error fetching collection info: ${error}`);
        observer.next(null);
        observer.complete();
      });
    } else {
      // If it's not the root, just fetch the person data (no need for the info document)
      fetchPersonData().subscribe((result: any) => {
        observer.next(result);
        observer.complete();
      });
    }
  });
}






  //for getting the available tables

  // Function to fetch available collections (from a metadata collection or custom logic)
  fetchAvailableCollections(): Observable<string[]> {
    // Reference to the specific document in 'collections_metadata' collection
    const docRef = doc(this.firestore, 'Collections_metadata', '1');  // Assuming document ID is '1'
    console.log('Fetching available collections...');
  
    return new Observable((observer) => {
      getDoc(docRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            console.log('Firestore document received:', docSnapshot.data());
  
            // Extract the 'Collections' array from the document
            const collections = docSnapshot.data()['Collections'] as string[];
  
            if (collections && collections.length > 0) {
              console.log('Collections found:', collections);
              observer.next(collections);
            } else {
              console.warn('No collections found in the document.');
              observer.next([]);
            }
          } else {
            console.warn('Document not found.');
            observer.next([]);
          }
          observer.complete();
        })
        .catch((error) => {
          console.error('Error fetching collections metadata:', error);
          observer.next([]);
          observer.complete();
        });
    });
  }
  

  getRandomColor(): string {
    // Define an array of blue and gray colors
    const colors = [
      '#0000FF', // Blue
      '#00FFFF',
      '#33FFFF',
      '#66FFFF',
      '#3333FF',
      '#000066',
      '#000088',
      '#000099',
      '#1E90FF', // Dodger Blue
      '#4682B4', // Steel Blue
      '#5F9EA0', // Cadet BlueW
    ];
  
    // Return a random color from the array
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onTileClick(tile: Tile): void {
    this.tiletext=tile.text;
    console.log('Tile clicked:', tile.text);
    this.fetchPersonWithChildren(this.parentId,tile.text).subscribe((parentData) => {
      this.jsonData = parentData;
      console.log('Final JSON Data:', JSON.stringify(this.jsonData, null, 2));
    });
  }

}
