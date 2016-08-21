var CONFIG = (function() {
  /*version 12.4
  service timestamps debug datetime msec
  service timestamps log datetime msec
  no service password-encryption
  !
  hostname Router01
  !
  boot-start-marker
  boot-end-marker
  !
  !
  no aaa new-model
  !
  resource policy
  !
  memory-size iomem 5
  ip subnet-zero
  no ip icmp rate-limit unreachable
  ip cef
  ip tcp synwait-time 5
  !
  !
  !
  !
  no ip domain lookup
  !
  !
  !
  vlan 100,500
  !
  !
  !
  !
  !
  interface FastEthernet0/0
   no ip address
   shutdown
   duplex auto
   speed auto
  !
  interface FastEthernet0/1
   no ip address
   shutdown
   duplex auto
   speed auto
  !
  interface FastEthernet1/0
   switchport
   switchport mode trunk
   switchport trunk encapsulation dot1q
   switchport trunk allowed vlan 100 ,110, 120 - 124
  !
  interface FastEthernet1/1
   switchport
   switchport mode access
   switchport access vlan 500
  !
  interface FastEthernet1/2
  !
  interface FastEthernet1/3
  !
  interface FastEthernet2/0
   no ip address
   shutdown
   duplex auto
   speed auto
  !
  interface FastEthernet2/0.10
   encapsulation dot1q 10
   ip address 192.168.2.254 255.255.255.0
  !
  interface Vlan1
   no ip address
  !
  interface Vlan100
   ip address 192.168.0.1 255.255.255.0
  !
  interface Vlan500
   ip address 172.16.0.1 255.255.255.0
  !
  ip classless
  !
  no ip http server
  no ip http secure-server
  !
  no cdp log mismatch duplex
  !
  !
  control-plane
  !
  !
  !
  line con 0
   exec-timeout 0 0
   privilege level 15
   logging synchronous
  line aux 0
   exec-timeout 0 0
   privilege level 15
   logging synchronous
  line vty 0 4
   login
  !
  !
  end
  */
}).toString().split('*')[1];


/* *********************************
 *
 * ********************************/
function to_prefix(subnet) {
  prefix_list = subnet.split(".").map(function(elm) {
    return Number(elm).toString(2);
  });
  return prefix_list.join('').match(/^(1+)/)[1].length;
}

/* *********************************
 *
 * ********************************/
function parse_if(c) {
  var interf = {};
  var m = null;

  // interface / port type(subinterface/svi/physical)
  if (m = c.match(/^interface (.+)$/m)) {
    interf["interface"] = m[1];
    if (/.+?\.\d+/.test(m[1])) {
      interf["type"] = "subinterface";
    } else if (/vlan\s*\d+/i.test(m[1])) {
      interf["type"] = "svi";
    } else {
      interf["type"] = "physical";
    }
  }

  // shutdown
  interf["shutdown"] = /^\s+shutdown$/m.test(c);

  // description
  if (m = c.match(/^\s+description (.+)$/m)) {
    interf["description"] = m[1];
  }

  // switchport
  if (interf["type"] == "physical") {
    if (m = c.match(/^\s+no switchport$/m)) {
      // do nothing
    } else {
      if (m = c.match(/^\s+switchport mode (.+)$/m)) {
        // access/trunk判定
        interf["switchport"] = {
          "mode": m[1]
        };
        if (m = c.match(/^\s+switchport trunk allowed vlan (.+)$/m)) {
          var vlans = m[1].replace(/\s/g, "").split(/,/);
          interf["switchport"]["vlans"] = [];
          for (i in vlans) {
            if (/-/.test(vlans[i])) {
              // 100-102の場合 100, 101, 102を追加する
              var s = Number(vlans[i].split("-")[0]);
              var e = Number(vlans[i].split("-")[1]);
              for (s; s < e; s++) {
                interf["switchport"]["vlans"].push(s);
              }
            } else {
              interf["switchport"]["vlans"].push(Number(vlans[i]));
            }
          }
        } else if (m = c.match(/^\s+switchport access vlan (.+)$/m)) {
          interf["switchport"]["vlans"] = [Number(m[1])];
        }
      }
    }
  } else if (interf["type"] == "svi") {
    interf["vlan"] = c.match(/^interface Vlan(.+)$/m)[1];
  }

  // ip address
  if (m = c.match(/^\s+ip address (.+) (.+)$/m)) {
    interf["ip_address"] = {
      "address": m[1],
      "prefix": to_prefix(m[2])
    };
  }

  return interf;
}

// Ciscoコンフィグファイルを引数にコンフィグをパース
// JSONを返却
function parse_config_file() {
  // ---------------------------------
  // 返却値の作成
  // ---------------------------------
  var conf = {
    "nodes": [],
    "adjacencies": []
  }

  // ---------------------------------
  // node情報取得
  //   TODO: 本来は複数ファイルに対して実行する
  // ---------------------------------
  var node = {
    "hostname": CONFIG.match(/^\s+hostname (.+)$/m)[1],
    "interfaces": []
  }

  //
  var m = CONFIG.match(/interface [\s\S.]+?!/g);
  for (i in m) {
    node["interfaces"].push(parse_if(m[i]));
  }

  conf["nodes"].push(node);

  // ---------------------------------
  // 隣接判定
  //   TODO: どうするこれ
  // ---------------------------------

  console.log(JSON.stringify(conf));

  return conf;
}
