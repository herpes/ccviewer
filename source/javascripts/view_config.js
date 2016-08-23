/****************
 * Const
 ****************/
const INTERFACE_NAMES = {
  'FastEthernet': 'Fe',
  'GigabitEthernet': 'Gi',
  'Vlan': 'SVI'
};

const NODE_WIDTH = 800;
const NODE_HEIGHT = 200;

/****************
 * Functions
 ****************/
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
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
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

  if (interface_info.type == 'svi') {
    // ---------------------------------
    // SVIインタフェースオブジェクトの設定
    // ---------------------------------
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
    
    var interface_name = new fabric.IText("" + interface_info.vlan, {
      fontSize: 10,
      fill: "#ffffff"
    });

    interf.type = 'svi';
    interf.interface_name = interface_name;
    
    // SVIオブジェクトの下に表示する情報
    interf.descriptions = [];
    
    // IPアドレス
    if ('ip_address' in interface_info && 'address' in interface_info.ip_address) {
      var ip_addr_text = interface_info.ip_address.address + "/" + interface_info.ip_address.prefix;
      var ip_address = new fabric.IText(ip_addr_text, {
	left: 0,
	top: 0,
	fontSize: 12,
	hasControls: false
      });
      interf.descriptions.push(ip_address);
    }
  } else if(interface_info.type == 'physical'){
    // ---------------------------------
    // 物理IFオブジェクトの設定
    // ---------------------------------
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

    // 物理IFオブジェクトの下に表示する情報
    interf.descriptions = [];
    // 物理IFのインタフェース名
    var interface_name = new fabric.IText(abbreviate(interface_info.interface), {
      left: 0,
      top: 0,
      fontSize: 12,
      hasControls: false
    });
    interf.descriptions.push(interface_name);

    // SubIF設定時の検索用タグ
    interf.interface_name = interface_info.interface;
    
  } else if(interface_info.type = 'subinterface'){
    // ---------------------------------
    // SubIFオブジェクトの設定
    // サブインタフェースは画面上表示しない
    // ---------------------------------

    // ---------------------------------
    // 既に作成済みの物理IFのdescriptionに情報追加
    // ---------------------------------
    for (var int_idx in node.interfaces) {
      var i = node.interfaces[int_idx];

      var if_name = interface_info.interface.match(/(.+)\.(.+)/)[1];
      var subif_id = interface_info.interface.match(/(.+)\.(.+)/)[2];

      if (i.interface_name == if_name) {
	// SubIF番号とIPアドレス情報追加
	if ('ip_address' in interface_info && 'address' in interface_info.ip_address) {
	  var ip_addr_text = "." + subif_id + ":" + interface_info.ip_address.address + "/" + interface_info.ip_address.prefix;
	  var ip_address = new fabric.IText(ip_addr_text, {
	    left: 0,
	    top: 0,
	    fontSize: 12,
	    hasControls: false
	  });
	  i.descriptions.push(ip_address);
	}
      }
    }
  }

  // Set description
  // TODO

  // add Interface to Node
  if (interf != null) {
    node.interfaces.push(interf);
  }

  return interf;
}

// set Interface top, height from node position
function setInterfacePosition(node) {
  var interface_count = 0;
  var svi_count = 0;

  for (var int_idx in node.interfaces) {
    var interf = node.interfaces[int_idx];

    if (interf.type == 'svi') {
      svi_count += 1;
    } else {
      interface_count += 1;
    }
  }

  var d = node.width / (interface_count + 1);
  var svi_d = node.width / (svi_count + 1);

  var i = 0;
  var svi_i = 0;

  for (var int_idx in node.interfaces) {
    var interf = node.interfaces[int_idx];

    if (interf.type == 'svi') {
      // SVI
      svi_i += 1;

      interf.left = node.left - node.width / 2 + svi_d * svi_i;
      interf.top = node.top + 15;
      interf.interface_name.left = interf.left;
      interf.interface_name.top = interf.top;

    } else {
      // physical or SubIF
      i += 1;

      // Set Interface Object position
      interf.left = node.left - node.width / 2 + d * i;
      interf.top = node.height / 2 + node.top - 10 / 2;
    }

    // Set Interface descriptions potision
    for (var desc_idx in interf.descriptions) {
      interf.descriptions[desc_idx].left = interf.left;
      interf.descriptions[desc_idx].top = interf.top + 15 * (Number(desc_idx) + 1);
    }
  }
}

// set Node information position
function setNodePositsion(node) {
  node.hostname.left = node.left;
  node.hostname.top = node.top;
}

// Node list
node_list = [];

// 初期関数
function load() {
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  var config_drop = document.getElementById('network');

  config_drop.addEventListener('dragover', dragOverHandler);
  config_drop.addEventListener('drop', dropHandler);
}

// JSON化したコンフィグファイルを
// fabricのオブジェクトに変換し、canvasに追加
function viewConfig(config) {
  var canvas = new fabric.Canvas('network', {
    selection: false
  });

  // CiscoコンフィグファイルをJSON形式に変換
  // (parse-view.js内の関数)
  var configuration = parse_config_file(config);

  // JSON化したコンフィグファイルをオブジェクトに変換
  for (var node_idx in configuration.nodes) {
    // Get Node
    var node_info = configuration.nodes[node_idx];
    var node = makeNode(node_info, NODE_WIDTH/2, NODE_HEIGHT/2);
    node_list.push(node);

    for (var int_idx in node_info.interfaces) {
      // Get Interface
      var interface_info = node_info.interfaces[int_idx];
      addInterface(interface_info, node);
    }
  }

  // インタフェースオブジェクトの座標設定
  setInterfacePosition(node);

  // ノード情報、インタフェース情報をcanvasに追加
  for (var node_idx in node_list) {
    var node = node_list[node_idx];

    // ノード情報を追加
    canvas.add(node);
    canvas.add(node.hostname);

    // インタフェース情報を追加
    for (var int_idx in node.interfaces) {
      var interf = node.interfaces[int_idx];
      canvas.add(interf);

      // SVIはインタフェース名を追加
      if (interf.type == 'svi') {
        canvas.add(interf.interface_name);
      }

      // descriptionを追加
      for (var desc_idx in interf.descriptions) {
        canvas.add(interf.descriptions[desc_idx]);
      }
    }
  }

  // オブジェクト移動中のアクション
  canvas.on('object:moving', function(e) {
    var node = e.target;
    setInterfacePosition(node);
    setNodePositsion(node);

    canvas.renderAll();
  });
}

/*****************************
 * コンフィグファイルDnD関連
 *****************************/
// ドラッグ中のイベント関数
function dragOverHandler(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

// ドロップ時のイベント関数
function dropHandler(event) {
  event.stopPropagation();
  event.preventDefault();
  
  var files = event.dataTransfer.files;
  Array.prototype.forEach.call(files, function(file) {
    var reader = new FileReader();
    reader.addEventListener('load', function(event) {
      viewConfig(event.target.result);
    });

    // ファイルをテキストとして読み込み
    reader.readAsText(file);
  });
}
