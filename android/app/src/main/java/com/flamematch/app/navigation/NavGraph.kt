package com.flamematch.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.flamematch.app.ui.screens.SplashScreen
import com.flamematch.app.ui.screens.LoginScreen
import com.flamematch.app.ui.screens.RegisterScreen
import com.flamematch.app.ui.screens.HomeScreen
import com.flamematch.app.ui.screens.DiscoverScreen
import com.flamematch.app.ui.screens.MatchesScreen
import com.flamematch.app.ui.screens.LikesScreen
import com.flamematch.app.ui.screens.ChatScreen
import com.flamematch.app.ui.screens.ProfileScreen
import com.flamematch.app.ui.screens.WalletScreen
import com.flamematch.app.viewmodel.AuthViewModel

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Discover : Screen("discover")
    object Matches : Screen("matches")
    object Likes : Screen("likes")
    object Chat : Screen("chat/{userId}") {
        fun createRoute(userId: String) = "chat/$userId"
    }
    object Profile : Screen("profile")
    object Wallet : Screen("wallet")
}

@Composable
fun NavGraph(
    navController: NavHostController,
    viewModel: AuthViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = viewModel,
                onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Register.route) {
            RegisterScreen(
                viewModel = viewModel,
                onNavigateToLogin = { navController.popBackStack() },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToDiscover = { navController.navigate(Screen.Discover.route) },
                onNavigateToMatches = { navController.navigate(Screen.Matches.route) },
                onNavigateToLikes = { navController.navigate(Screen.Likes.route) },
                onNavigateToChat = { navController.navigate(Screen.Chat.createRoute("")) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                onNavigateToWallet = { navController.navigate(Screen.Wallet.route) }
            )
        }
        
        composable(Screen.Discover.route) {
            DiscoverScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Screen.Matches.route) {
            MatchesScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToChat = { navController.navigate(Screen.Chat.createRoute(it)) }
            )
        }
        
        composable(Screen.Likes.route) {
            LikesScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(
            route = Screen.Chat.route,
            arguments = listOf(navArgument("userId") { type = NavType.StringType })
        ) { backStackEntry ->
            ChatScreen(
                otherUserId = backStackEntry.arguments?.getString("userId"),
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(Screen.Profile.route) {
            ProfileScreen(
                viewModel = viewModel,
                onNavigateBack = { navController.popBackStack() },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Wallet.route) {
            WalletScreen(onNavigateBack = { navController.popBackStack() })
        }
    }
}
