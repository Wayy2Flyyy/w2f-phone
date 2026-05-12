-- W2F branded boot banner (client-side, no cross-resource imports).
local function w2fBannerClient(name, desc)
    print(('^5[W2F]^7 %s ^2[LOADED]^7 - %s ^3(by wayy2flyyy)^7'):format(name, desc or ''))
end

AddEventHandler('onClientResourceStart', function(rName)
    if rName ~= GetCurrentResourceName() then return end
    w2fBannerClient('W2F-Phone', 'Advanced Qbox smartphone OS')
end)
