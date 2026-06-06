function avatarInitial(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toLowerCase();
}

export default function JobSeekerProfileHeader({ profile }) {
  const title = profile.headline?.trim() || 'Update your title';

  return (
    <section className="js-dash__card js-dash__profile">
      <div className="js-dash__avatar" aria-hidden="true">
        {avatarInitial(profile.fullName)}
      </div>
      <div className="js-dash__profile-info">
        <h1>{profile.fullName}</h1>
        <p className="js-dash__profile-line">
          <i className="ti ti-briefcase" aria-hidden="true" />
          {title}
        </p>
        <p className="js-dash__profile-line">
          <i className="ti ti-mail" aria-hidden="true" />
          {profile.email}
        </p>
        <a href="#profile" className="js-dash__profile-link">
          Update your profile &gt;
        </a>
      </div>
    </section>
  );
}
