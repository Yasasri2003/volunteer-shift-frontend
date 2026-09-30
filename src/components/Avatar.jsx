// src/components/Avatar.jsx
import { profilePictureUrl } from '../api/users';

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function Avatar({ user, size = 34, onClick, clickable = false }) {
  const url = profilePictureUrl(user?.profile_picture);

  const style = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    cursor: clickable ? 'pointer' : 'default',
  };

  return (
    <div className="avatar" style={style} onClick={onClick} title={clickable ? 'Edit profile' : undefined}>
      {url ? (
        <img src={url} alt={user?.name || 'Profile'} className="avatar-img" />
      ) : (
        initials(user?.name)
      )}
    </div>
  );
}
