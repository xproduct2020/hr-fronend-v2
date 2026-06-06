export default function JobSeekerActivities({ appliedJobs, savedJobs, jobInvitations }) {
  return (
    <section className="js-dash__card" id="activities">
      <h2 className="js-dash__card-title">Your Activities</h2>
      <div className="js-dash__activities">
        <div className="js-dash__activity js-dash__activity--blue">
          <div className="js-dash__activity-info">
            <strong>{appliedJobs}</strong>
            <span>Applied Jobs</span>
          </div>
          <i className="ti ti-send" aria-hidden="true" />
        </div>
        <div className="js-dash__activity js-dash__activity--pink">
          <div className="js-dash__activity-info">
            <strong>{savedJobs}</strong>
            <span>Saved Jobs</span>
          </div>
          <i className="ti ti-heart" aria-hidden="true" />
        </div>
        <div className="js-dash__activity js-dash__activity--green">
          <div className="js-dash__activity-info">
            <strong>{jobInvitations}</strong>
            <span>Job invitations</span>
          </div>
          <i className="ti ti-mail" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
