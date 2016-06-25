// Const
const INTERFACE_NAMES = {
    'FastEthernet': 'Fe',
    'GigabitEthernet': 'Gi',
    'Vlan': 'SVI'
};

// abbreviate some words
function abbreviate(str) {
    for (var k in INTERFACE_NAMES) {
        str = str.replace(k, INTERFACE_NAMES[k]);
    }
    return str;
}

// make Node Object
function makeNode(node_info, left, top) {
    // Set Node object parameter
    var node = new fabric.Rect({
        left: left,
        top: top,
        width: 400,
        height: 200,
        strokeWidth: 1,
        fill: '#bebebe',
        stroke: '#000',
        hasControls: false
    });

    // Set Node information
    //  - hostname
    var hostname = new fabric.IText(node_info.hostname, {
        left: left,
        top: top,
        fontSize: 12,
        hasControls: false
    });

    node.hostname = hostname;

    // Make Interface List
    node.interfaces = [];

    return node;
}

// add Interface Object to Node
function addInterface(interface_info, node) {
    var interf = null;

    // SVI
    if (interface_info.type == 'svi') {
      var interf = new fabric.Rect({
            left: 0,
            top: 0,
            width: 30,
            height: 15,
            fill: '#539dff',
            strokeWidth: 1,
            stroke: '#000',
            rx: 2,
            ry: 2,
            hasControls: false
        });
        var text = new fabric.Text("" + interface_info.vlan, {
          fontSize: 10,
          fill: "#ffffff"
        });

        interf.type = 'svi';
        interf.text = text;
    } else {
        var interf = new fabric.Rect({
            left: 0,
            top: 0,
            width: 10,
            height: 10,
            fill: '#97c18b',
            strokeWidth: 1,
            stroke: '#000',
            hasControls: false
        });
    }

    // add Interface to Node
    node.interfaces.push(interf);

    // Interface name
    var interface_name = new fabric.IText(abbreviate(interface_info.interface), {
        left: 0,
        top: 0,
        fontSize: 12,
        hasControls: false
    });

    // IP address
    if ('ip_address' in interface_info && 'address' in interface_info.ip_address) {
        var ip_address = new fabric.IText(interface_info.ip_address.address, {
            left: 0,
            top: 0,
            fontSize: 12,
            hasControls: false
        });
        interf.ip_address = ip_address;
    }
    interf.interface_name = interface_name;

    // set Interface position(top, left)
    setInterfacePosition(node);

    return interf;
}

// set Interface top, height from node position
function setInterfacePosition(node) {
    var interfaces_count = node.interfaces.length;
    var svi_count = 0;
    var int_count = 0;
    var d = node.width / (interfaces_count + 1);

    for (var int_idx in node.interfaces) {
        var interf = node.interfaces[int_idx];

        if(interf.type == 'svi') {
          // SVI
          svi_count += 1;

          interf.left = interf.interface_name.left = node.left - node.width / 2 + d * (svi_count) + d;
          interf.top = interf.interface_name.top = node.top + 15;
          interf.text.left = interf.left;
          interf.text.top = interf.top;

        } else {
          // physical or SubIF
          int_count += 1;

          interf.left = interf.interface_name.left = node.left - node.width / 2 + d * (int_count) + d;
          interf.top = interf.interface_name.top = node.height / 2 + node.top - 10 / 2;
        }
        // Interface name
        interf.interface_name.top += 15;

        // IP Address
        if ('ip_address' in interf) {
            interf.ip_address.top = interf.top + 30;
            interf.ip_address.left = interf.left;
        }

        // description

        //
    }
}

// set Node information position
function setNodePositsion(node) {
    node.hostname.left = node.left;
    node.hostname.top = node.top;
}

// Node list
node_list = [];

// ----------------------------------------------------
// MAIN
// ----------------------------------------------------
function load() {
    var canvas = this.__canvas = new fabric.Canvas('network', {
        selection: false
    });
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    var configuration = {
        'nodes': [{
            'hostname': 'Router01',
            'interfaces': [{
                'interface': 'FastEthernet 1/0',
                'shutdown': false,
                'type': 'physical',
                'description': '',
                'switchport': {
                    'mode': 'trunk',
                    'vlans': [1, 2, 100, 1002, 1003, 1004, 1005],
                }
            }, {
                'interface': 'FastEthernet 1/1.600',
                'shutdown': false,
                'type': 'subinterface',
                'description': '',
                'ip_address': {
                    'address': '192.168.10.1',
                    'prefix': 27
                }
            }, {
                'interface': 'Vlan100',
                'shutdown': false,
                'type': 'svi',
                'description': '',
                'vlan': 100,
                'ip_address': {
                    'address': '192.168.0.1',
                    'prefix': 27
                }
            }]
        }],
        'adjacencies': [{
            'a': {
                'hostname': 'Router01',
                'interface': 'FastEthernet 1/0'
            },
            'b': {
                'hostname': 'Router02',
                'interface': 'FastEthernet 1/0'
            }
        }, {
            'a': {
                'hostname': 'Router01',
                'interface': 'FastEthernet 1/1'
            },
            'b': {
                'hostname': 'Router03',
                'interface': 'FastEthernet 1/1'
            }
        }]
    };

    // Load Configuration
    for (var node_idx in configuration.nodes) {
        // Get Node
        var node_info = configuration.nodes[node_idx];
        var node = makeNode(node_info, 200, 200);
        node_list.push(node);

        for (var int_idx in node_info.interfaces) {
            // Get Interface
            var interface_info = node_info.interfaces[int_idx];
            addInterface(interface_info, node);
        }
    }

    // View Nodes and Interfaces
    for (var node_idx in node_list) {
        var node = node_list[node_idx];
        canvas.add(node);
        canvas.add(node.hostname);

        for (var int_idx in node.interfaces) {
            var interf = node.interfaces[int_idx];
            canvas.add(interf);

            // SVI
            if(interf.type == 'svi') {
              canvas.add(interf.text);
            } else {
              canvas.add(interf.interface_name);
            }

            if ('ip_address' in node.interfaces[int_idx]) {
                canvas.add(node.interfaces[int_idx].ip_address);
            }
        }
    }

    // Moving action
    canvas.on('object:moving', function(e) {
        var node = e.target;
        setInterfacePosition(node);
        setNodePositsion(node);

        canvas.renderAll();
    });
}
