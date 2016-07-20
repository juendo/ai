// query to return number of times a player led each role

module.exports = [
  	{
  		$match: {
  			"move.kind": "Lead"
  		}
  	},
  	{
  		$group: {
  			_id: {
  				name: "$name", 
  				role: "$move.role"
  			}, 
  			roles: {
  				$push: "$move.role" 
  			}
  		}
  	},
  	{
  		$group: {
  			_id: {
  				name: "$_id.name"
  			}, 
  			roles: {
  				$addToSet: {
  					role: "$_id.role", 
  					count: {
  						$size: "$roles"
  					}
  				}
  			}
  		}
  	}
  ];