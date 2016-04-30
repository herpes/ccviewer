var CONFIG = (function(){/*version 12.4
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
 switchport trunk allowed vlan 100
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
*/}).toString().split('*')[1]

//var RE_IF = /interface ()/;

// console.log(CONFIG.split('\n')[0])
mode = 0
/*
for(i in CONFIG.split('\n')){
  if(/^!$/.exec(lines[i])){
    // exit xx mode
  }

  if(/interface (.+)$/.exec(lines[i])){
    // IF mode
  }
}
*/
