Neutrino docs:


swapWavesToNeutrino - обменять waves на neutrino
swapNeutrinoToWaves - обменять neutrino на waves
withdraw(address) - вывести нейтрино для указанного адреса (допилю параметр) 

setOrder - поставить зявку на исполнение бонда
cancelOrder(id) - отменить заявку на исполнение бонда
getNewNeutrino(address) - получить новые нейтрино

data value:
price - текущая цена waves/usd
auction_contract - адрес контракта аукциона

neutrino_{address} - баланс neutrino юзера на контракте
waves_{address} - баланс waves юзера на контракте
balance_block_{address} - на каком блоке были заблокирован вывод для юзера

orderbook - список заявок на исполнение бонда. Имеет вид: _{id}_{id}_{id}
order_amount_{id} - количество бондов в ордере
order_owner_{id} - владелец ордера
order_height_{id} - блок на котором выставлялся ордер


Auction docs:
