// Initialize Firebase
var config = {
    apiKey: "AIzaSyAWVXjquspKBvxwhZo9EIzLYav9mEkJHw4",
    authDomain: "vinet-77117.firebaseapp.com",
    databaseURL: "https://vinet-77117.firebaseio.com",
    projectId: "vinet-77117",
    storageBucket: "",
    messagingSenderId: "233967204421"
};
var maxDh = 100;
firebase.initializeApp(config);
angular.module('MyApp', ['ngMaterial', 'data-table', 'ngFileUpload'])
    .controller('AppCtrl', function ($scope, $http, $mdDialog, $mdToast) {
        var all = 'Tất cả';
        $scope.partner = all;
        $scope.lstPartner = [all];
        $scope.dateSearch = new Date();
        $scope.data = [];
        $scope.blackLst = false;
        $scope.maDonHang = '';
        $scope.index = 0;
        $scope.lstNV = [{name: all}];
        $scope.searchKey = '';
        $scope.locDay = 'month';
        var blackLst = [];
        var database = firebase.database();
        getListHD(all);
        getBlackLst();
        getPartner();
        var removeLis;
        getPartner();
        var commentsRef = database.ref('nv');
        commentsRef.on('child_added', function (data) {
            $scope.$apply(function () {
                $scope.lstNV.push({name: data.key})
            });
        });
        $scope.dateLocale = {
            formatDate: function (date) {
                var m = moment(date);
                return m.isValid() ? m.format('DD / MM / YYYY') : '';
            }
        };
        $scope.dateLocaleMonth = {
            formatDate: function (date) {
                var m = moment(date);
                return m.isValid() ? m.format('MM / YYYY') : '';
            }
        };
        $scope.addPartner = function (ev) {
            var confirm = $mdDialog.prompt()
                .parent(angular.element(document.body))
                .title('Thêm nhân đối tác')
                .textContent('Nhập tên đối tác.')
                .placeholder('Nhập...')
                .targetEvent(ev)
                .required(true)
                .ok('Xong!')
                .cancel('Hủy');

            $mdDialog.show(confirm).then(function (result) {
                database.ref('partner/' + result).once('value').then(function (snapshot) {
                    if (!snapshot.val()) {
                        database.ref('partner/' + result).set({
                            name: result
                        }).then(function (value) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Thêm đối tác thành công')
                                    .position('top left')
                                    .hideDelay(3000)
                            );
                        });
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Tên đối tác đã tồn tại')
                                .position('top left')
                                .hideDelay(3000)
                        );
                    }
                });

            });
        };
        $scope.options = {
            emptyMessage: 'Không có đơn hàng ',
            rowHeight: 50,
            headerHeight: 50,
            footerHeight: 50,
            columns: [{
                name: "Mã Đơn hàng",
                prop: "code"
            }, {
                name: "Ngày",
                prop: "date"
            }, {
                name: "Số điện thoại",
                prop: "phone"
            }, {
                name: "Nhân viên",
                prop: "nv"
            },{
                name:"Đối tác",
                prop:"partner"
            }],
            columnMode: 'force',
            paging: {
                externalPaging: true
            }
        };
        $scope.paging = function (offset, size) {

        };
        $scope.addNewNV = function (ev) {
            var confirm = $mdDialog.prompt()
                .parent(angular.element(document.body))
                .title('Thêm nhân viên mới')
                .textContent('Nhập tên nhân viên.')
                .placeholder('Nhập...')
                .targetEvent(ev)
                .required(true)
                .ok('Xong!')
                .cancel('Hủy');

            $mdDialog.show(confirm).then(function (result) {
                database.ref('nv/' + result).once('value').then(function (snapshot) {
                    if (!snapshot.val()) {
                        database.ref('employees/' + result).set({
                            name: result
                        });
                        database.ref('nv/' + result).set({
                            name: result
                        });
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Tên nhân viên đã tồn tại')
                                .position('top left')
                                .hideDelay(3000)
                        );
                    }
                });

            }, function () {

            });
        };
        var show = true;
        $scope.upHd = function (file, ev) {
            if (file) {
                var confirm = $mdDialog.confirm()
                    .parent(angular.element(document.body))
                    .title('Tải Lên file đơn hàng')
                    .textContent('Xác nhân tải lên file ' + file.name)
                    .targetEvent(ev)
                    .ok('Xác nhận')
                    .cancel('Hủy');

                $mdDialog.show(confirm).then(function () {
                    Papa.parse(file, {
                        header: true,
                        complete: function (results, file) {
                            show = true;
                            for (var i = 0; i < results.data.length; i++) {
                                if (results.data[i]['Order Number'] && results.data[i]['Shipping Phone Number'] && !isNaN(results.data[i]['Shipping Phone Number'])) {
                                    setDataAll(results.data[i]['Shipping Phone Number'], results.data[i]['Order Number']);
                                    for (var j = 1; j < $scope.lstNV.length; j++) {
                                        if (results.data[i]['Order Number'] && !isNaN(results.data[i]['Shipping Phone Number'])) {
                                            updatePhone('employees/', $scope.lstNV[j].name, results.data[i]['Shipping Phone Number'], results.data[i]['Order Number']);
                                        }

                                    }
                                }
                            }
                        }
                    });
                });
            }
        };
        $scope.upBlackLst = function (file, ev) {
            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Tải Lên file khách hàng đen')
                .textContent('Xác nhân tải lên file ' + file.name)
                .targetEvent(ev)
                .ok('Xác nhận')
                .cancel('Hủy');

            $mdDialog.show(confirm).then(function () {
                Papa.parse(file, {
                    header: true,
                    complete: function (results, file) {
                        var show = true;
                        for (var i = 0; i < results.data.length; i++) {
                            // if (results.data[i]['Shipping Phone Number']) {
                            //     database.ref('black lst/' + results.data[i]['Shipping Phone Number'])
                            //         .set('').then(function (value) {
                            //         if (show) {
                            //             $mdToast.show(
                            //                 $mdToast.simple()
                            //                     .textContent('Tải file thành công')
                            //                     .position('top left')
                            //                     .hideDelay(3000)
                            //             );
                            //         }
                            //         show = false;
                            //     }).catch(function (value) {
                            //         if (show) {
                            //             show = false;
                            //             $mdToast.show(
                            //                 $mdToast.show({
                            //                     hideDelay: 3000,
                            //                     position: 'top left',
                            //                     template: '<md-toast><span style="color: red ">Tải file không thành công</span> </md-toast>'
                            //                 })
                            //             );
                            //         }
                            //     });
                            //
                            // }
                            for (var j = 0; j < $scope.lstNV.length; j++) {
                                if (results.data[i]['Order Number'] && !isNaN(results.data[i]['Shipping Phone Number'])) {
                                    updateBlackLst($scope.lstNV[j].name, results.data[i]['Shipping Phone Number'], results.data[i]['Order Number']);
                                }

                            }
                        }
                    }
                });
            });
        };

        function updateBlackLst(name, phone, code) {
            database.ref('employees/' + name + '/order/').orderByChild('phone').equalTo(phone).once('value').then(function (snapshot) {
                if (snapshot.val()) {
                    database.ref('blackLst/' + name + '/order/' + code).set(snapshot.val()[code]);
                }
            })
        };

        $scope.selectNv = function (index) {
            if ($scope.index !== index) {
                $scope.options.paging.count = 0;
                if (index === 0) {
                    $scope.options.columns = [{
                        name: "Mã Đơn hàng",
                        prop: "code"
                    }, {
                        name: "Ngày",
                        prop: "date"
                    }, {
                        name: "Số điện thoại",
                        prop: "phone"
                    }, {
                        name: "Nhân Viên",
                        prop: "nv"
                    },{
                        name:"Đối tác",
                        prop:"partner"
                    }]
                }
                else {
                    if ($scope.index === 0) {
                        $scope.options.columns = [{
                            name: "Mã Đơn hàng",
                            prop: "code"
                        }, {
                            name: "Ngày",
                            prop: "date"
                        },{
                            name:"Đối tác",
                            prop:"partner"
                        }]
                    }
                }
                $scope.index = index;
                $scope.data = [];
                getListHD($scope.lstNV[index].name);
            }
        };
        $scope.addHD = function (ev) {
            $scope.maDonHang = $scope.maDonHang.toUpperCase();
            database.ref('employees/Tất cả/order/' + $scope.maDonHang).once('value').then(function (snapshot) {
                if (snapshot.val() && snapshot.val().date) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(true)
                            .title('Lỗi thêm đơn hàng')
                            .textContent('Đơn hàng ' + $scope.maDonHang + ' Đã được nhân viên ' + snapshot.val().nv + ' Thêm vào ' + snapshot.val().date)
                            .ok('Ok')
                            .targetEvent(ev)
                    );
                }
                else {
                    addDH()
                }
            })
        };
        $scope.searchHD = function (ev) {
            $scope.searchKey = $scope.searchKey.toLocaleUpperCase();
            if ($scope.searchKey) {
                database.ref('employees/Tất cả/order/' + $scope.searchKey).once('value').then(function (snapshot) {
                    if (snapshot.val()) {
                        if (snapshot.val().nv) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .clickOutsideToClose(true)
                                    .title('Đơn hàng : ' + snapshot.key)
                                    .textContent('Nhân viên : ' + snapshot.val().nv + ' -- Thời gian : ' + snapshot.val().date)
                                    .ok('Ok')
                                    .targetEvent(ev)
                            );
                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .clickOutsideToClose(true)
                                    .title('Đơn hàng : ' + snapshot.key)
                                    .textContent('Đơn hàng chưa được nhân viên nào xử lý')
                                    .ok('Ok')
                                    .targetEvent(ev)
                            );
                        }
                    }
                    else {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title('Tìm Đơn Hàng')
                                .textContent('Đơn hàng không tồn tại')
                                .ok('Ok')
                                .targetEvent(ev)
                        );

                    }
                })
            }
        };
        $scope.locHd = function () {
            $scope.options.paging.count = 0;
            $scope.data = [];
            getListHD($scope.lstNV[$scope.index].name);
        };
        $scope.selectPartner = function () {
            $scope.options.paging.count = 0;
            $scope.data = [];
            getListHD($scope.lstNV[$scope.index].name);
        };
        $scope.checkBlackLst = function () {
            $scope.data=[];

        };

        function getPartner() {
            database.ref('partner').on('child_added', function (data) {
                $scope.$apply(function () {
                    $scope.lstPartner.push(data.key)
                });
            });
        }

        function setDataAll(phone, code) {
            database.ref('employees/' + all + '/order/' + code).once('value').then(function (snapshot) {
                if (!snapshot.val()) {
                    setTotal(all);
                }
                database.ref('employees/Tất cả/order/' + code + '/phone')
                    .set(phone).then(function (value) {
                    if (show) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Tải file thành công')
                                .position('top left')
                                .hideDelay(3000)
                        );
                    }
                    show = false;
                }).catch(function (value) {
                    if (show) {
                        show = false;
                        $mdToast.show({
                            hideDelay: 3000,
                            position: 'top left',
                            template: '<md-toast><span style="color: red ">Tải file không thành công</span> </md-toast>'
                        })
                    }
                });
            });
        }

        function setTotal(code) {
            database.ref('employees/' + code + '/total').transaction(function (post) {
                return (post || 0) + 1;
            });
        }

        function getBlackLst() {
            database.ref('black lst').on('child_added', function (data) {
                blackLst.push(data.key);
            })
        }

        function updatePhone(ref, name, phone, code) {
            database.ref(ref + name + '/order/' + code).once('value').then(function (snapshot) {
                if (snapshot.val()) {
                    database.ref(ref + name + '/order/' + snapshot.key + '/phone')
                        .set(phone)
                }
            });
        }

        function addDH() {
            if ($scope.maDonHang) {
                var donHang = angular.copy($scope.maDonHang);
                $scope.maDonHang = '';
                var dh = {};
                dh.partner=$scope.partner;
                dh['date'] = moment(new Date()).format('DD / MM / YYYY - HH:mm ');
                dh['day'] = moment(new Date()).format('DD / MM / YYYY');
                dh['month'] = moment(new Date()).format('MM / YYYY');
                dh[$scope.partner + 'day'] = moment(new Date()).format('DD / MM / YYYY');
                dh[$scope.partner + 'month'] = moment(new Date()).format('MM / YYYY');
                if ($scope.maDonHang !== all) {
                    database.ref('employees/' + $scope.lstNV[$scope.index].name + '/order/' + donHang).update(dh);
                    dh['nv'] = $scope.lstNV[$scope.index].name;
                    database.ref('employees/Tất cả/order/' + donHang).update(dh).then(function () {
                        setTotal($scope.lstNV[$scope.index].name);
                        setTotal(all);
                        $mdToast.show({
                            hideDelay: 2000,
                            position: 'top left',
                            template: '<md-toast>Đã thêm đơn hàng&nbsp<span style="color: green ;flex: none">' + donHang + '</span>&nbspthành công </md-toast>'
                        });
                    }).catch(function (error) {
                        $mdToast.show({
                            hideDelay: 2000,
                            position: 'top left',
                            template: '<md-toast><span style="color: green ;flex: none">' + donHang + '</span><span style="color: darkred ;flex: none">&nbspThêm thất bại </span></md-toast>'
                        });

                    });
                }
            } else {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Mã đơn hàng không được để trống')
                        .position('top left')
                        .hideDelay(3000)
                );
            }
        }

        function getListHD(code) {
            var ref = '';
            if (!$scope.blackLst) {
                ref = 'employees/';
            } else {
                ref = 'blackLst/';

            }
            if (removeLis) {
                removeLis.off();
            }
            if ($scope.locDay === 'all' && $scope.partner === all) {
                removeLis = database.ref(ref + code + '/order').limitToLast(maxDh);
            }
            if ($scope.locDay !== 'all' && $scope.partner === all) {
                var dateSearch = '';
                if ($scope.locDay === 'day') {
                    dateSearch = moment($scope.dateSearch).format('DD / MM / YYYY');
                } else {
                    dateSearch = moment($scope.dateSearch).format('MM / YYYY');
                }
                removeLis = database.ref(ref + code + '/order').limitToLast(maxDh).orderByChild($scope.locDay).equalTo(dateSearch);
            }
            if ($scope.locDay === 'all' && $scope.partner !== all) {
                removeLis = database.ref(ref + code + '/order').limitToLast(maxDh).orderByChild($scope.partner + 'date');
            }
            if ($scope.locDay !== 'all' && $scope.partner !== all) {
                var dateSearch = '';
                if ($scope.locDay === 'day') {
                    dateSearch = moment($scope.dateSearch).format('DD / MM / YYYY');
                } else {
                    dateSearch = moment($scope.dateSearch).format('MM / YYYY');
                }
                removeLis = database.ref(ref + code + '/order').limitToLast(maxDh).orderByChild($scope.partner + $scope.locDay).equalTo(dateSearch);
            }
            removeLis.on('child_added', function (data) {
                $scope.$apply(function () {
                    $scope.data.unshift({
                        code: data.key,
                        date: data.val().date,
                        phone: data.val().phone,
                        nv: data.val().nv,
                        partner:data.val().partner
                    });
                    $scope.options.paging.count = $scope.data.length;
                });
            });
        }
    })
    .config(function ($mdDateLocaleProvider) {
        $mdDateLocaleProvider.months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        $mdDateLocaleProvider.shortMonths = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'];
        $mdDateLocaleProvider.days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        $mdDateLocaleProvider.shortDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    });

