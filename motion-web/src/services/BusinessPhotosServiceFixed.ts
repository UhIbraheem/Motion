// Deprecated shim mirroring BusinessPhotosService to avoid random fallbacks
import { fetchStepPhotos, fetchBusinessInfo } from './PlacesPhotoService';

class BusinessPhotosServiceShim {
  async getAdventurePhotos(stepDescriptors: Array<{ name: string; location?: string }>) {
    return fetchStepPhotos(stepDescriptors, 1);
  }
  async getAdventurePhotosMulti(stepDescriptors: Array<{ name: string; location?: string }>, photosPerStep = 2) {
    return fetchStepPhotos(stepDescriptors, photosPerStep);
  }
  async getBusinessInfo(name: string, location?: string) {
    return fetchBusinessInfo(name, location);
  }
}

export default new BusinessPhotosServiceShim();
