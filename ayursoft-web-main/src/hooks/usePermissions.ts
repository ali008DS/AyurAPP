import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { setPermissions } from '../redux/slices/user-role';
import ApiManager from '../components/services/apimanager';

export const usePermissions = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadPermissions = async () => {
      const isAdmin =
        localStorage.getItem('isAdmin') === 'true' ||
        sessionStorage.getItem('isAdmin') === 'true';

      if (isAdmin) {
        return;
      }

      const storedPermissions =
        localStorage.getItem('permissions') ||
        sessionStorage.getItem('permissions');

      if (storedPermissions) {
        try {
          const permissions = JSON.parse(storedPermissions);
          dispatch(setPermissions(permissions));
        } catch (error) {
          console.error('Error parsing stored permissions:', error);
        }
      }

      const storedUser =
        localStorage.getItem('user') || sessionStorage.getItem('user');

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const userDetails = await ApiManager.getUserById(user.id);

          if (userDetails?.data?.userRole?.permissions) {
            dispatch(setPermissions(userDetails.data.userRole.permissions));
            const storage =
              localStorage.getItem('token') ? localStorage : sessionStorage;
            storage.setItem(
              'permissions',
              JSON.stringify(userDetails.data.userRole.permissions)
            );
          }
        } catch (error) {
          console.error('Error fetching user permissions:', error);
        }
      }
    };

    loadPermissions();
  }, [dispatch]);
};
