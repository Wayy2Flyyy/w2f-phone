local Banking = W2FPhone.Banking
local Core = W2FPhone.Core

-- READ-ONLY snapshot. Money editing is not allowed from the phone at any path.
function Banking.Snapshot(src)
    local money = Core.GetMoney(src)
    local pd = Core.GetPlayerData(src)
    local accountName = pd and pd.charinfo and (
        ('%s %s'):format(pd.charinfo.firstname or '', pd.charinfo.lastname or ''):gsub('^%s+', ''):gsub('%s+$', '')
    ) or 'Account Holder'

    return {
        accountName = accountName,
        citizenid = pd and pd.citizenid,
        cash = money.cash,
        bank = money.bank,
        crypto = money.crypto,
        total = money.cash + money.bank,
        recentTransactions = {}, -- Foundation: hookable by w2f-banking if desired.
    }
end
