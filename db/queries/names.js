// all names in the database

module.exports = [
	{
		$project: {
      _id: 0,
      name: "$name"
    }
  },
  {
    $group: {
      _id: {
        name: "$name"
      }
    }
	}
];