// how may times each player took each possible move for each action

module.exports = [
	{
		$unwind: "$game.players",
	},
  	{
  		$project: {
  			name: "$name",
  			move: "$move.kind",
  			action: "$game.players.actions.kind",
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
          id: "$_id",
          name: "$name",
          move: "$move"
        },
        action: {
            $first: "$action"
        }
  		}
  	},
    {
      $group: {
        _id: {
          name: "$_id.name",
          move: "$_id.move",
          action: "$action"
        },
        moves: {
          $push: "$_id.move"
        }
      }
    },
  	{
  		$group: {
  			_id: {
  				name: "$_id.name",
  				action: "$_id.action"
  			}, 
  			roles: {
  				$addToSet: {
  					role: "$_id.move", 
  					count: {
  						$size: "$moves"
  					}
  				}
  			}
  		}
  	},
  	{
  		$group: {
  			_id: {
  				name: "$_id.name"
  			},
  			moves: {
  				$addToSet: {
  					action: "$_id.action",
  					moves: "$roles"
  				}
  			}
  		}
  	}
  ];