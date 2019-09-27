# Neutrino: an algorithmic price-stable cryptocurrency protocol collateralized by WAVES token
Проект содержит несколько контрактов:
* auction.ride - контракт реализующий аукцион Neutrino Bond
* neutrino.ride - основной контракт Neutrino

# Описание Callable методов
#### Auction:
* setOrder(price : Int, position: Int) - выставить оредр в указанную позицию
* cancelOrder(orderId : String) - отменить ордер
* executeOrder()  - выполнить ордер (продать USD-NB)
#### Neutrino
* setCurrentPrice(newPrice : Int) - передать цену (доступен только оракулам)
* finilizeCurrentPrice()  - финализировать цену поставляемую оракулами
* adminUnlock(newPrice : Int) - раблокировать платформу с указанной ценой (разблокируется, если 2/3 админов проголосовали)
* adminLock() - заблокировать платформу (заблокируется, если 2/3 админов проголосовали)
* swapWavesToNeutrino() - обменять waves на neutrino
* swapNeutrinoToWaves() - обменять neutrino на waves 
* withdraw(account : String) - вывести срадства из контракта 
* generateBond()  - сгенерировать Neutrino Bond
* setOrder() - выставить ордер на ликвидацию Neutrino Bond
* cancelOrder(orderId : String) - отменить ордер на ликвидацию
* executeOrder() - выполнить первый ордер на ликвидацию Neutrino Bond

