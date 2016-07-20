// how many times a player had the chance to follow a certain action

module.exports = [
	{
		$unwind: "$game.players",
	},
	{
		$match: {
			"game.players.actions.kind": "Follow"
		}
	},
  	{
  		$project: {
  			name: "$name",
  			playerName: "$game.players.name",
  			action: "$game.players.actions.color",
  			valid: {
  				$eq: ["$name", "$game.players.name"]
  			}
  		}
  	},
  	{
  		$match: {
  			"valid": true
  		}
  	},
  	{
  		$unwind: "$action"
  	},
  	{
  		$group: {
  			_id: {
  				name: "$name", 
  				action: "$action"
  			}, 
  			actions: {
  				$push: "$action" 
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
  					role: "$_id.action", 
  					count: {
  						$size: "$actions"
  					}
  				}
  			}
  		}
  	}
  ];