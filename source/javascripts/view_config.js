// make Node Object
function makeNode(node_info, left, top) {
  // Set Node object parameter
  var node = new fabric.Rect({
    left: left,
    top: top,
    width: 100,
    height: 50,
    strokeWidth: 1,
    fill: '#999',
    stroke: '#000'
  });

  // Set Node information
  //  - hostname
  node.hostname = node_info.hostname;

  node.interfaces = [];
  
  return node;
}

// add Interface Object to Node
function addInterface(interface_info, node) {
  var interf = new fabric.Rect({
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    fill: '#444',
    strokeWidth: 1,
    stroke: '#000'
  });

  // add Interface to Node
  node.interfaces.push(interf);

  // set Interface position(top, left)
  setInterfacePosition(node);
  
  return interf;
}

// set Interface top, height from node position
function setInterfacePosition(node) {
  var interfaces_count = node.interfaces.length;
  var d = node.width/(interfaces_count+1)
  
  for(int_idx in node.interfaces) {
    var interf = node.interfaces[int_idx];

    interf.left = node.left - node.width/2 + d*(int_idx) + d,
    console.log(node.width/(interfaces_count+1));
    interf.top = node.height/2 + node.top - 10/2
  }
}

// view Node object
function viewNode(canvas, nodes) {

}

// view Interface object
function viewInterface(canvas, interfaces) {

  for(var int_idx in interfaces) {
    var interf = interfaces[int_idx]
    interf && canvas.add(interf);
  }
  
  canvas.add(interf)
}

// Node list
node_list = [];

function load() {
  var canvas = this.__canvas = new fabric.Canvas('network', { selection: false });
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  var configuration =
      {
	"nodes": [
	  {
	    "hostname": "Router01",
	    "interfaces": [
              {
		"interface": "FastEthernet 1/0",
		"shutdown": false,
		"type": "physical",
		"description": "",
		"switchport": {
		  "mode": "trunk",
		  "vlans": [1, 2, 100, 1002, 1003, 1004, 1005],
		}
              },
              {
		"interface": "FastEthernet 1/1.600",
		"shutdown": false,
		"type": "subinterface",
		"description": ""
              },
              {
		"interface": "Vlan100",
		"shutdown": false,
		"type": "svi",
		"description": "",
		"switchport": {
		  "mode": "access",
		  "vlans": [1],
		}
              }
	    ]
	  }
	],
	"adjacencies": [
	  {
	    "a": { "hostname": "Router01", "interface": "FastEthernet 1/0" },
	    "b": { "hostname": "Router02", "interface": "FastEthernet 1/0" }
	  },
	  {
	    "a": { "hostname": "Router01", "interface": "FastEthernet 1/1" },
	    "b": { "hostname": "Router03", "interface": "FastEthernet 1/1" }
	  }
	]
      }

  // Load Configuration
  for(node_idx in configuration.nodes) {
    // Get Node
    var node_info = configuration.nodes[node_idx];
    var node = makeNode(node_info, 200, 200);
    node_list.push(node);

    for(int_idx in node_info.interfaces) {
      // Get Interface
      var interface_info = node_info.interfaces[int_idx];
      addInterface(interface_info, node);
    }
  }

  // View Nodes and Interfaces
  for(var node_idx in node_list) {
    var node = node_list[node_idx]
    canvas.add(node);
    

  }

  // Moving action
  canvas.on('object:moving', function(e) {
    var obj = e.target;
    setInterfacePosition(obj);
    
    canvas.renderAll();
  });
}
