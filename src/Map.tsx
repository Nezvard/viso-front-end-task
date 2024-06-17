import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getFirestore,
  doc,
  writeBatch,
} from "firebase/firestore";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { app } from "./firebaseConfig";
import "./App.css";

const db = getFirestore(app);

const containerStyle = {
  width: "100%",
  height: "700px",
};

const center = {
  lat: 49.84336818523409,
  lng: 24.026482528084973,
};

interface MarkerType {
  id: number;
  position: google.maps.LatLng | null;
  docId: string;
}

const Map: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }
      markerClustererRef.current = new MarkerClusterer({
        markers: markers.map((marker) => {
          const gMarker = new google.maps.Marker({
            position: marker.position!,
            label: `${marker.id}`,
            draggable: marker.id === selectedMarkerId,
          });
          google.maps.event.addListener(gMarker, "click", () =>
            handleMarkerClick(marker.id)
          );
          google.maps.event.addListener(
            gMarker,
            "dragend",
            (event: google.maps.MapMouseEvent) =>
              handleMarkerDragEnd(event, marker.id)
          );
          return gMarker;
        }),
        map: mapRef.current,
      });
    }
  }, [markers, selectedMarkerId]);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newMarker = {
        id: markers.length + 1,
        position: event.latLng,
        docId: "",
      };
      setMarkers([...markers, newMarker]);

      try {
        const docRef = await addDoc(collection(db, "quests"), {
          id: newMarker.id,
          location: {
            lat: newMarker.position.lat(),
            lng: newMarker.position.lng(),
          },
          timestamp: new Date(),
        });
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.id === newMarker.id
              ? { ...marker, docId: docRef.id }
              : marker
          )
        );
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  const handleMarkerClick = (id: number) => {
    setSelectedMarkerId(id);
  };

  const handleMarkerDragEnd = async (
    event: google.maps.MapMouseEvent,
    id: number
  ) => {
    if (event.latLng) {
      const newMarkers = markers.map((marker) => {
        if (marker.id === id) {
          return { ...marker, position: event.latLng };
        }
        return marker;
      });
      setMarkers(newMarkers);

      const markerToUpdate = newMarkers.find((marker) => marker.id === id);
      if (markerToUpdate) {
        try {
          const markerDocRef = doc(db, "quests", markerToUpdate.docId);
          await updateDoc(markerDocRef, {
            location: {
              lat: markerToUpdate.position!.lat(),
              lng: markerToUpdate.position!.lng(),
            },
          });
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      }
    }
  };

  const deleteAllMarkers = async () => {
    try {
      const batch = writeBatch(db);
      markers.forEach((marker) => {
        const markerDocRef = doc(db, "quests", marker.docId);
        batch.delete(markerDocRef);
      });
      await batch.commit();
      setMarkers([]);
    } catch (e) {
      console.error("Error deleting documents: ", e);
    }
  };

  const deleteMarker = async () => {
    if (selectedMarkerId !== null) {
      const markerToDelete = markers.find(
        (marker) => marker.id === selectedMarkerId
      );
      if (markerToDelete) {
        try {
          const markerDocRef = doc(db, "quests", markerToDelete.docId);
          await deleteDoc(markerDocRef);
          setMarkers(
            markers.filter((marker) => marker.id !== selectedMarkerId)
          );
        } catch (e) {
          console.error("Error deleting document: ", e);
        }
      }
      setSelectedMarkerId(null);
    }
  };

  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyCengqvSFZpdP4d4tcCrzjUzZHaDVJ9sUw">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={handleMapClick}
          onLoad={(map: google.maps.Map) => {
            mapRef.current = map;
          }}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position!}
              label={`${marker.id}`}
              draggable={marker.id === selectedMarkerId}
              onClick={() => handleMarkerClick(marker.id)}
              onDragEnd={(event) => handleMarkerDragEnd(event, marker.id)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      <div className="button-container">
        <button onClick={deleteAllMarkers}>Delete All Markers</button>
        <button onClick={deleteMarker} disabled={selectedMarkerId === null}>
          Delete Selected Marker
        </button>
      </div>
    </div>
  );
};

export default Map;
