pragma solidity ^0.7.0;

import "./Staking.sol";
import "./ERC20.sol";
import "./Ownable.sol";
import "./Deprecatable.sol";

abstract contract StandartToken is Staking, ERC20, Ownable, Deprecateble {
  struct Snapshots {
    uint256[] ids;
    uint256[] values;
  }

  uint256 internal _totalSupply;
  uint256 internal _currentDeposits;
  uint256 internal _currentSnapshotId;
  mapping(address => uint256) internal _balances;
  mapping(address => mapping(address => uint256)) internal _allowances;
  mapping(uint256 => uint256) internal _rewards;
  mapping(uint256 => uint256) internal _totalSupplies;
  mapping(address => uint256) internal _lastRewardSnapshot;
  mapping(address => Snapshots) internal _accountBalanceSnapshots;

  function deposit(address account, uint256 amount) external onlyOwner onlyNotDeprecated override virtual returns (bool)  {
    require(amount > 0, "amount should be > 0");
    require(account != address(0), "deposit to the zero address");

    uint256 lastSnapshotId;
    Snapshots storage snapshots = _accountBalanceSnapshots[account];
    uint256 snapshotLength = snapshots.ids.length;
    if (snapshotLength != 0) {
      lastSnapshotId = snapshots.ids[snapshotLength - 1];
    }

    uint256 temp = _balances[account] + amount;
    require(temp >= amount, "addition overflow for new balance");
    _balances[account] = temp;

    if (lastSnapshotId == _currentSnapshotId + 2) {
      temp = snapshots.values[snapshotLength - 1] + amount;
      require(temp >= amount, "addition overflow for amount");
      snapshots.values[snapshotLength - 1] = temp;
    } else {
      snapshots.ids.push(_currentSnapshotId + 2);
      snapshots.values.push(temp);
    }
    _currentDeposits += amount;

    emit Transfer(address(0), account, amount);
    return true;
  }

  function stake(uint256 reward) external onlyOwner onlyNotDeprecated override virtual returns (bool) {
    require(reward > 0, "reward should be > 0");

    uint256 oldTotalSupply = _totalSupply;
    uint256 oldIndex = _currentSnapshotId;
    uint256 oldDeposits = _currentDeposits;

    require(oldIndex + 1 >= oldIndex, "addition overflow for currentIndex");
    _currentSnapshotId = oldIndex + 1;
    _rewards[oldIndex + 1] = reward;
    _totalSupplies[oldIndex + 1] = oldTotalSupply;

    if (oldTotalSupply == 0) {
      require(oldTotalSupply + oldDeposits >= oldTotalSupply, "addition overflow for totalSupply");
      _totalSupply = oldTotalSupply + oldDeposits;
    } else {
      require(oldTotalSupply + oldDeposits + reward >= oldTotalSupply, "addition overflow for totalSupply");
      _totalSupply = oldTotalSupply + oldDeposits + reward;
    }

    _currentDeposits = 0;
    emit Reward(oldIndex, reward);
    return true;
  }

  function withdraw(address account) external onlyOwner onlyNotDeprecated override virtual returns (bool) {
    uint256 balanceTotal = balanceOf(account);

    require(balanceTotal > 0, "balance should be > 0");
    uint256 temp = _totalSupply;
    if (balanceTotal > temp) {
      _totalSupply = 0;
      uint256 oldDeposits = _currentDeposits;
      require(balanceTotal - temp <= oldDeposits, "balanceTotal - oldTotalSupply > oldDeposits");
      _currentDeposits = oldDeposits - (balanceTotal - temp);
    } else {
      _totalSupply = temp - balanceTotal;
    }

    Snapshots storage snapshots = _accountBalanceSnapshots[account];
    uint256 lastIndex = snapshots.ids.length;
    uint256 oldIndex = _currentSnapshotId;
    uint256 length = snapshots.ids.length;
    while (lastIndex > 0 && snapshots.ids[lastIndex - 1] > oldIndex) {
      lastIndex--;
    }

    temp = lastIndex + 3;
    for (; lastIndex < temp; lastIndex++) {
      if (lastIndex >= length) {
        snapshots.ids.push(lastIndex);
        snapshots.values.push(0);
      } else {
        snapshots.ids[lastIndex] = lastIndex;
        snapshots.values[lastIndex] = 0;
      }
    }
    _lastRewardSnapshot[account] = oldIndex;
    _balances[account] = 0;

    emit Transfer(account, address(0), balanceTotal);
    return true;
  }

  // ERC20
  function totalSupply() external view override virtual returns (uint256) {
    return _totalSupply + _currentDeposits;
  }

  function balanceOf(address account) public view override virtual returns (uint256) {
    uint256 currentSnapshotId = _lastRewardSnapshot[account] + 1;
    uint256 lastSnapshotId = _currentSnapshotId;
    Snapshots storage balancesSnapshots = _accountBalanceSnapshots[account];

    uint256 balance = _balances[account];
    uint256 balancesLength = balancesSnapshots.ids.length;

    uint256 balanceIndex;
    uint256 low;
    uint256 high = balancesLength;

    if (balancesLength != 0) {
      while (low < high) {
        uint256 mid = (low / 2) + (high / 2) + ((low % 2 + high % 2) / 2);
        if (balancesSnapshots.ids[mid] > currentSnapshotId) {
          high = mid;
        } else {
          low = mid + 1;
        }
      }

      if (low > 0 && balancesSnapshots.ids[low - 1] == currentSnapshotId) {
        balanceIndex = low - 1;
      } else {
        balanceIndex = low;
      }
    }

    uint256 total;
    for (; currentSnapshotId <= lastSnapshotId; currentSnapshotId++) {
      while (balanceIndex < balancesLength && (balancesLength == 0 ? 0 : balancesSnapshots.ids[balanceIndex]) < currentSnapshotId) {
        balanceIndex++;
      }

      if (balanceIndex == balancesLength) {
        low = balance + total;
      } else {
        if (balancesSnapshots.ids[balanceIndex] > currentSnapshotId) {
          low = total;
          continue;
        } else {
          low = (balanceIndex == balancesLength ? balance : balancesSnapshots.values[balanceIndex]) + total;
          if (low == 0) {
            continue;
          }
        }
      }

      high = _totalSupplies[currentSnapshotId];
      if (high == 0) {
        continue;
      }

      low *= _rewards[currentSnapshotId];
      low /= high;
      require(low + total >= total, "addition overflow for total");
      total += low;
    }

    require(balance + total >= balance, "addition overflow for balanceOf");
    return balance + total;
  }

  function allowance(address owner, address spender) external view override virtual returns (uint256) {
    return _allowances[owner][spender];
  }

  function _approve(address owner, address spender, uint256 amount) internal onlyNotDeprecated virtual {
    require(owner != address(0), "ERC20: approve from the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");

    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }

  function approve(address spender, uint256 amount) external override virtual returns (bool) {
    _approve(msg.sender, spender, amount);
    return true;
  }

  function increaseAllowance(address spender, uint256 addedValue) external override virtual returns (bool) {
    uint256 temp = _allowances[msg.sender][spender];
    require(temp + addedValue >= temp, "addition overflow");
    _approve(msg.sender, spender, temp + addedValue);
    return true;
  }

  function decreaseAllowance(address spender, uint256 subtractedValue) external override virtual returns (bool) {
    uint256 temp = _allowances[msg.sender][spender];
    require(subtractedValue <= temp, "ERC20: decreased allowance below zero");
    _approve(msg.sender, spender, temp - subtractedValue);
    return true;
  }

  function transfer(address recipient, uint256 amount) external override virtual returns (bool) {
    _transfer(msg.sender, recipient, amount);
    return true;
  }

  function transferFrom(address sender, address recipient, uint256 amount) external override virtual returns (bool) {
    _transfer(sender, recipient, amount);

    uint256 temp = _allowances[sender][msg.sender];
    require(amount <= temp, "ERC20: transfer amount exceeds allowance");
    _approve(sender, msg.sender, temp - amount);
    return true;
  }

  function _transfer(address sender, address recipient, uint256 amount) internal onlyNotDeprecated virtual {
    require(amount > 0, "amount should be > 0");
    require(sender != address(0), "ERC20: transfer from the zero address");
    require(recipient != address(0), "ERC20: transfer to the zero address");

    uint256 balance = balanceOf(sender);
    Snapshots storage snapshots = _accountBalanceSnapshots[sender];
    uint256 temp = snapshots.ids.length;
    uint256 length = snapshots.ids.length;
    uint256 oldSnapshotId = _currentSnapshotId;
    while (temp > 0 && snapshots.ids[temp - 1] >= oldSnapshotId) {
      snapshots.values[temp - 1] = balance - amount;
      temp--;
    }

    temp = 0;
    if (length != 0) {
      temp = snapshots.ids[length - 1];
    }
    if (temp == oldSnapshotId + 2) {
      snapshots.values[length - 1] = balance - amount;
    } else {
      snapshots.ids.push(oldSnapshotId + 2);
      snapshots.values.push(balance - amount);
    }
    _lastRewardSnapshot[sender] = oldSnapshotId;
    require(amount <= balance, "ERC20: transfer amount exceeds balance");
    _balances[sender] = balance - amount;

    balance = balanceOf(recipient);
    snapshots = _accountBalanceSnapshots[recipient];
    temp = snapshots.ids.length;
    length = snapshots.ids.length;
    while (temp > 0 && snapshots.ids[temp - 1] >= oldSnapshotId) {
      snapshots.values[temp - 1] = balance - amount;
      temp--;
    }

    _lastRewardSnapshot[recipient] = oldSnapshotId;
    oldSnapshotId = temp + 3;
    for (; temp < oldSnapshotId; temp++) {
      if (temp >= length) {
        snapshots.ids.push(temp);
        snapshots.values.push(balance + amount);
      } else {
        snapshots.ids[temp] = temp;
        snapshots.values[temp] = balance + amount;
      }
    }
    require(balance + amount >= amount, "addition overflow for balance");
    _balances[recipient] = balance + amount;

    emit Transfer(sender, recipient, amount);
  }
}
