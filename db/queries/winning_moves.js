// how may times each player took each possible move for each action

module.exports = [
	{
		$match: {
			"winner": {
				$ne: null
			}
		}
	},
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
  			},
  			winning: {
  				$eq: ["$name", "$winner"]
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
	          winning: "$winning",
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
          winning: "$_id.winning",
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
  				winning: "$_id.winning",
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
  				winning: "$_id.winning"
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