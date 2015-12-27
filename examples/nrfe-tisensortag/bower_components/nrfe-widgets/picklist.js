
	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style.marginLeft = "0";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));

		var tdef = def.picklist.split(',');
		var idproperty = def.idproperty || 'name'

		var table = document.createElement('table');
		table.className = "mdl-data-table mdl-js-data-table  mdl-shadow--2dp";
		if(def.style)
		{
			node.setAttribute('style', def.style);
		}
		else
		{

			node.style.width = "100%";
			node.style.maxHeight = "200px";
			node.style.overflowY = "scroll";
			node.style.margin = "0";
		}

		var thead = document.createElement('thead');
		table.appendChild(thead);
		var thtr = document.createElement('tr');

		thead.appendChild(thtr);
		tdef.forEach(function(colname)
		{
			var th = document.createElement('th');
			th.style.background = "#ddd";
			th.style.fontWeight = "bold";
			th.className="mdl-data-table__cell--non-numeric";
			th.style.width = "100%";
			th.innerHTML = '<strong>'+colname+'</strong>';
			thtr.appendChild(th);
		});
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var seenitems = []

		var addRow = function(item)
		{
			console.log(JSON.stringify(item));
			if (item && item[idproperty] && !seenitems[item[idproperty]])
			{
				console.log('adding new row for item ' + item[idproperty]);
				seenitems[item[idproperty]] = item;
				var tr = document.createElement('tr');
				tbody.appendChild(tr);
				tdef.forEach(function (p)
				{
					var td = document.createElement('td');
					td.className = "mdl-data-table__cell--non-numeric";
					td.innerHTML = item[p];
					tr.appendChild(td);
				});
				tr.addEventListener('click', function (e)
				{
					var p = {payload: item};
					console.log('sending item ' + JSON.stringify(p));
					def.out(p);
				});
			}
		};

		def.in = function(msg)
		{
			if(msg && msg.payload)
			{
				var item = msg.payload;
				//console.log("---------------------- picklist population");
				if(item.forEach)
				{
					console.log('picklist got array. iterating..')
					item.forEach(function(e)
					{
						addRow(e)
					})
				}
				else
				{
					addRow(item)
				}
			}
		};

		//-----------------------
		node.appendChild(table);
		return node;
	};
	module.exports = fn;