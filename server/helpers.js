module.exports = {
  isActive: (page, check) => (page === check) ? 'is-active' : '',
  secondsToSandM: totalS => {
    const minutes = Math.floor(totalS / 60);
    const seconds = totalS - minutes * 60;
    return {
      minutes,
      seconds
    }
  },
  userJurisdiction: (userSchool, examenSchool) => userSchool._id.equals(examenSchool._id)
};