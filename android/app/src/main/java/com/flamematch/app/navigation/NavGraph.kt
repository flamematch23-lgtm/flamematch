package com.flamematch.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.flamematch.app.ui.screens.CashierScreen
import com.flamematch.app.ui.screens.HandHistoryScreen
import com.flamematch.app.ui.screens.LobbyScreen
import com.flamematch.app.ui.screens.ProfileScreen
import com.flamematch.app.ui.screens.TableScreen
import com.flamematch.app.viewmodel.PokerSessionViewModel

sealed class Screen(val route: String) {
    object Lobby : Screen("Lobby")
    object Table : Screen("Table")
    object HandHistory : Screen("HandHistory")
    object Profile : Screen("Profile")
    object Cashier : Screen("Cashier")
}

@Composable
fun NavGraph(
    navController: NavHostController,
    viewModel: PokerSessionViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Lobby.route
    ) {
        composable(Screen.Lobby.route) {
            LobbyScreen(
                selectedStake = viewModel.selectedStake,
                onSelectStake = viewModel::selectStake,
                onNavigateToTable = { navController.navigate(Screen.Table.route) },
                onNavigateToCashier = { navController.navigate(Screen.Cashier.route) },
                onNavigateToHistory = { navController.navigate(Screen.HandHistory.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) }
            )
        }

        composable(Screen.Table.route) {
            TableScreen(
                selectedStake = viewModel.selectedStake,
                chipsOnTable = viewModel.player.chipsOnTable,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.HandHistory.route) {
            HandHistoryScreen(onNavigateBack = { navController.popBackStack() })
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                player = viewModel.player,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Cashier.route) {
            CashierScreen(
                player = viewModel.player,
                onDeposit = viewModel::deposit,
                onWithdraw = viewModel::withdraw,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
