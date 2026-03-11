import { ProfileService } from '../../../application/profile/profile.service';
import { userRepository } from './auth.registry';

export const profileService = new ProfileService(userRepository);
