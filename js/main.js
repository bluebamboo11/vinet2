// Initialize Firebase
var config = {
    apiKey: "AIzaSyAWVXjquspKBvxwhZo9EIzLYav9mEkJHw4",
    authDomain: "vinet-77117.firebaseapp.com",
    databaseURL: "https://vinet-77117.firebaseio.com",
    projectId: "vinet-77117",
    storageBucket: "",
    messagingSenderId: "233967204421"
};
firebase.initializeApp(config);
angular.module('MyApp', ['ngMaterial', 'data-table', 'ngFileUpload'])
    .controller('AppCtrl', function ($scope, $http, $mdDialog, $mdToast) {
        $scope.dateSearch = new Date();
        $scope.month='';
        $scope.modeDate ='day';
        $scope.data = [];
        $scope.maDonHang = '';
        $scope.index = 0;
        $scope.lstNV = [{name: 'Tất cả'}];
        $scope.searchKey = '';
        $scope.locDay = undefined;
        var database = firebase.database();
        getListHD('Tất cả');
        var removeLis;
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

        $scope.options = {
            emptyMessage:'Không có đơn hàng ',
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
                name: "Nhân Viên",
                prop: "nv"
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
        $scope.upHd = function (file) {
            Papa.parse(file, {
                header: true,
                complete: function (results, file) {
                    console.log("Parsing complete:", results, file);
                }
            });
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
                        }, {
                            name: "Số điện thoại",
                            prop: "phone"
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
                if (snapshot.val()) {
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
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title('Tìm Đơn Hàng')
                                .textContent('Đơn hàng ' + snapshot.key + ' Đã được nhân viên ' + snapshot.val().nv + ' Thêm vào ' + snapshot.val().date)
                                .ok('Ok')
                                .targetEvent(ev)
                        );

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
            if($scope.locDay==='day'){
                $scope.modeDate ='day';

            }if($scope.locDay==='month') {

            }
            getListHD($scope.lstNV[$scope.index].name);
        };

        function addDH() {
            if ($scope.maDonHang) {
                var donHang = angular.copy( $scope.maDonHang);
                $scope.maDonHang = '';
                if ($scope.maDonHang !== 'Tất Cả') {
                    database.ref('employees/' + $scope.lstNV[$scope.index].name + '/order/' + donHang).set({
                        date: moment(new Date()).format('DD / MM / YYYY - HH:mm '),
                        day: moment(new Date()).format('DD / MM / YYYY'),
                        month: moment(new Date()).format('MM / YYYY')
                    })
                }
                database.ref('employees/Tất cả/order/' + donHang).set({
                    date: moment(new Date()).format('DD / MM / YYYY - HH:mm '),
                    day: moment(new Date()).format('DD / MM / YYYY'),
                    month: moment(new Date()).format('MM / YYYY'),
                    nv: $scope.lstNV[$scope.index].name
                }).then(function () {
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
            if (removeLis) {
                removeLis.off();
            }
            if ($scope.locDay && $scope.locDay !== 'all') {
                var dateSearch = '';
                if ($scope.locDay === 'day') {
                    dateSearch = moment($scope.dateSearch).format('DD / MM / YYYY');
                } else {
                    dateSearch = moment($scope.dateSearch).format('MM / YYYY');
                }
                removeLis = database.ref('employees/' + code + '/order').orderByChild($scope.locDay).equalTo(dateSearch);
            } else {
                removeLis = database.ref('employees/' + code + '/order');
            }
            removeLis.limitToLast(50).on('child_added', function (data) {
                $scope.$apply(function () {
                    $scope.data.unshift({
                        code: data.key,
                        date: data.val().date,
                        phone: data.val().phone,
                        nv: data.val().nv
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

    })
//     .filter('reverse', function() {
//     return function(items) {
//         return items.slice().reverse();
//     };
// });
